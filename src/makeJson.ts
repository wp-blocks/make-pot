import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";

// Import your utility functions
import { createHash } from "node:crypto";
import {
	type GetTextTranslation,
	type GetTextTranslations,
	po,
} from "gettext-parser";

class MakeJsonCommand {
	protected json_options = 0;

	public async invoke(
		fileContents: string[],
		args: {
			useMap: string | string[] | null;
			purge: boolean;
			updateMoFiles: boolean;
			prettyPrint: boolean;
			destination: string;
			debug: boolean;
		},
	): Promise<void> {
		const source: string = path.resolve(fileContents[0]);

		if (
			!source ||
			!fs.existsSync(source) ||
			(!fs.statSync(source).isFile() && !fs.statSync(source).isDirectory())
		) {
			throw new Error("Source file or directory does not exist!");
		}

		const destination: string = fs.statSync(source).isFile()
			? path.dirname(source)
			: source;

		const map: Record<string, string[]> | null = this.buildMap(mapPaths);
		if (map && Object.keys(map).length === 0) {
			throw new Error("No valid keys found. No file was created.");
		}

		// Two fs.existsSync() checks in case of a race condition.
		if (
			!fs.existsSync(destination) &&
			!fs.mkdirSync(destination, { recursive: true }) &&
			!fs.existsSync(destination)
		) {
			throw new Error("Could not create destination directory!");
		}

		let resultCount = 0;

		const files: string[] = fs.statSync(source).isFile()
			? [source]
			: glob(path.join(source, "**/*.po"));

		for (const file of files) {
			if (
				fs.statSync(file).isFile() &&
				fs.statSync(file) &&
				path.extname(file) === ".po"
			) {
				const result: string[] = this.makeJson(file, destination, map);
				resultCount += result.length;

				if (purge) {
					const removed: boolean = this.removeJsStringsFromPoFile(file);

					if (!removed) {
						console.warn(`Could not update file ${path.basename(source)}`);
						continue;
					}

					if (updateMoFiles) {
						const fileBasename: string = path.basename(file, ".po");
						const destinationFile: string = path.join(
							destination,
							`${fileBasename}.mo`,
						);

						const translations: Translations = Translations.fromPoFile(file);
						if (!translations.toMoFile(destinationFile)) {
							console.warn(`! Could not create file ${destinationFile}`);
						}
					}
				}
			}
		}

		console.log(
			`Created ${resultCount} ${resultCount === 1 ? "file" : "files"}.`,
		);
	}

	protected buildMap(pathsOrMaps: string[]): Record<string, string[]> | null {
		const map: Record<string, string[]> = {};

		const paths: string[] = pathsOrMaps
			? pathsOrMaps.filter((key): key is string => true)
			: [];
		console.info(
			`Using ${paths.length} map files: ${paths.join(", ")}`,
			"make-json",
		);

		const toTransform: Array<[Record<string, string[]>, string]> = maps.map(
			(value, index) => [value, `inline object ${index}`],
		);

		for (const mapPath of paths) {
			if (!fs.existsSync(mapPath) || fs.statSync(mapPath).isDirectory()) {
				console.warn(`Map file ${mapPath} does not exist`);
				continue;
			}

			const json: Record<string, string[]> = JSON.parse(
				fs.readFileSync(mapPath, "utf8"),
			);
			if (!json || typeof json !== "object") {
				console.warn(`Map file ${mapPath} invalid`);
				continue;
			}

			toTransform.push([json, mapPath]);
		}

		for (const transform of toTransform) {
			let [json, file] = transform;
			const keyNum: number = Object.keys(json).length;
			// normalize contents to string[]
			json = Object.fromEntries(
				Object.entries(json).map(([key, value]) => [
					key,
					Array.isArray(value)
						? value.filter((v) => typeof v === "string")
						: [],
				]),
			);
			console.log(
				`Dropped ${Object.keys(json).length - keyNum} keys from ${file}`,
				"make-json",
			);

			map = { ...map, ...json };
		}

		return map;
	}

	protected makeJson(
		sourceFile: string,
		destination: string,
		map: Record<string, string[]> | null,
	): string[] {
		const mapping: GetTextTranslations = {};
		const fileContent: string = fs.readFileSync(sourceFile, "utf8");
		const translations = po.parse(fileContent);
		const result: string[] = [];

		let baseFileName: string = path.basename(sourceFile, ".po");

		const domain: string | null = translations.headers.TextDomain || null;

		if (domain && !baseFileName.startsWith(domain)) {
			baseFileName = `${domain}-${baseFileName}`;
		}

		translations.forEach((translation: GetTextTranslation) => {
			const sources: string[] = (translation.getReferences() || [])
				.map((reference) => {
					const file: string = reference[0];

					if (file.endsWith(".min.js")) {
						return file.slice(0, -7) + ".js";
					}

					if (file.endsWith(".js")) {
						return file;
					}

					return null;
				})
				.filter(Boolean) as string[];

			const uniqueSources: string[] = Array.from(new Set(sources));

			uniqueSources.forEach((source) => {
				if (!mapping[source]) {
					mapping[source] = new Translations();

					// TODO: Uncomment once the bug is fixed.
					// See https://core.trac.wordpress.org/ticket/45441
					// mapping[source].setDomain(translations.getDomain());

					mapping[source].setHeader(
						"Language",
						translations.getLanguage() || "",
					);
					mapping[source].setHeader(
						"PO-Revision-Date",
						translations.getHeader("PO-Revision-Date") || "",
					);

					const pluralForms: [number, string] | null =
						translations.getPluralForms();
					if (pluralForms) {
						const [count, rule] = pluralForms;
						mapping[source].setPluralForms(count, rule);
					}
				}

				mapping[source].append(translation);
			});
		});

		result.push(...this.buildJsonFiles(mapping, baseFileName, destination));

		return result;
	}

	protected referenceMap(
		references: [string, number][],
		map: Record<string, string[]> | null,
	): [string, number][] {
		if (map === null) {
			return references;
		}

		const temp: string[][] = references.map(([reference, index]) => {
			const file: string = reference;

			if (map[file]) {
				return map[file];
			}

			return [];
		});

		const referencesResult: [string, number][] = temp
			.flat()
			.map((value): [string, number] => [value, 0]);

		return referencesResult;
	}

	protected buildJsonFiles(
		mapping: Record<string, GetTextTranslations>,
		baseFileName: string,
		destination: string,
	): string[] {
		const result: string[] = [];

		for (const file of Object.keys(mapping)) {
			const translations: GetTextTranslations = mapping[file];

			const hash: string = createHash("md5").update(file).digest("hex");
			const destinationFile: string = path.join(
				destination,
				`${baseFileName}-${hash}.json`,
			);

			const success: boolean = po.compile(translations, destinationFile, {
				json: this.json_options,
				source: file,
			});

			if (!success) {
				warning(
					`Could not create file ${path.basename(destinationFile, ".json")}`,
				);
				continue;
			}

			result.push(destinationFile);
		}

		return result;
	}

	protected removeJsStringsFromPoFile(sourceFile: string): boolean {
		const { translations }: GetTextTranslations = po.parse(sourceFile);

		translations.forEach((translation: GetTextTranslation) => {
			if (!translation.comments?.reference) {
				return;
			}

			for (const reference of translation.comments?.reference) {
				const file: string = reference[0];

				if (!file.endsWith(".js")) {
					continue;
				}
			}

			delete translations.translations[translation.msgid];
		});

		return po.compile(translations, sourceFile);
	}
}

const command = new MakeJsonCommand();
command
	.invoke(process.argv.slice(2), {})
	.catch((error) => console.error(error));
