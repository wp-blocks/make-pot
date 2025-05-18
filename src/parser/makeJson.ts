import crypto from "node:crypto";
import * as fs from "node:fs";
import path from "node:path";
import { transformSync } from "@babel/core";
import type { SetOfBlocks } from "gettext-merger";
import {
	type GetTextTranslation,
	type GetTextTranslations,
	po,
} from "gettext-parser";
import { glob } from "glob";
import { IsoCodeRegex, allowedFunctions, modulePath } from "../const.js";
import type { JedData, MakeJson, MakeJsonArgs } from "../types.js";
import { getPkgJsonData } from "../utils/common.js";
import { doTree } from "./tree";

export class MakeJsonCommand {
	/**
	 * The source file path.
	 * Should be the "build" directory containing .js files
	 * @private
	 */
	private readonly source: string;
	/**
	 * The destination file path.
	 * Should be the "languages" directory containing .po files
	 * @private
	 */
	private readonly destination: string;
	/**
	 * The allowed file extensions.
	 * @private
	 */
	private readonly allowedFormats: string[];
	/**
	 * Remove old POT files.
	 * @private
	 */
	private readonly purge: boolean;
	/**
	 * Pretty print JSON.
	 * @private
	 */
	private readonly prettyPrint: boolean;
	/**
	 * Enable debug mode.
	 * @private
	 */
	private debug: boolean;
	/**
	 * The script to be translated.
	 * @private
	 */
	private scriptName: string | string[] | undefined;
	/**
	 * The paths to be translated.
	 * @private
	 */
	private paths: object | undefined;
	/**
	 * The source directory.
	 * @private
	 */
	private readonly sourceDir: string;
	/**
	 * Whenever to strip unused translations from js files
	 * @private
	 */
	private stripUnused: boolean;

	/**
	 * The constructor.
	 * @param args - The arguments to the command.
	 */
	public constructor(args: MakeJsonArgs) {
		this.sourceDir = path.relative(args.paths.cwd, args.source ?? "");
		if (!fs.existsSync(this.sourceDir)) {
			console.error("Source directory not found", args);
			throw new Error(`Source directory ${this.sourceDir} not found`);
		}

		this.stripUnused = args.stripUnused;
		this.scriptName = args.scriptName;
		this.source = args.source;
		this.destination = args.destination;
		this.allowedFormats = args.allowedFormats ?? [
			".ts",
			".tsx",
			".js",
			".jsx",
			".mjs",
			".cjs",
		];
		this.purge = args.purge;
		this.prettyPrint = args.prettyPrint;
		this.debug = args.debug;
		this.paths = args.paths;
	}

	/**
	 * The main function. Parses the PO files and generates the JSON files.
	 */
	public async exec(): Promise<Record<string, MakeJson>> {
		// get all the files in the source directory
		const files = await glob("**/*.po", { cwd: this.destination, nodir: true });

		console.log("Found po files", files, "in", this.destination, "folder");

		// get all the po files
		const output: Record<string, MakeJson> = {};
		for (const file of files) {
			if (!this.scriptName) {
				this.scriptName = await glob("**/*.js", {
					cwd: this.source,
					nodir: true,
				});
				console.log(
					`Found script: ${this.scriptName} in ${this.source} folder`,
				);
			}

			if (typeof this.scriptName === "string") {
				const pot = this.addPot(file, this.scriptName);
				if (pot.data) {
					output[pot.filename] = pot.data;
				} else {
					console.log(
						`❌ Translation strings not found in Script ${this.scriptName} in ${file} po file`,
					);
				}
			} else if (Array.isArray(this.scriptName)) {
				for (const script of this.scriptName) {
					const pot = this.addPot(file, script);
					if (pot.data) {
						output[pot.filename] = pot.data;
					} else {
						console.log(
							`❌ Translation strings not found in Script ${script} in ${file} po file`,
						);
					}
				}
			}
		}

		// write the json files
		for (const [filename, content] of Object.entries(output)) {
			let contentString: string;
			if (this.purge) {
				if (fs.existsSync(path.join(this.destination, filename))) {
					console.log(
						`Removing ${path.join(this.destination, filename)} as the purge option is enabled`,
					);
					fs.unlinkSync(path.join(this.destination, filename));
				}
				contentString = JSON.stringify(
					content,
					null,
					this?.prettyPrint ? 2 : 0,
				);
			} else {
				const oldJedContent = fs.readFileSync(
					path.join(this.source, filename),
					"utf8",
				);

				contentString = JSON.stringify(
					{ ...content, ...JSON.parse(oldJedContent) },
					null,
					this?.prettyPrint ? 2 : 0,
				);
			}

			const destinationPath = path.join(this.destination, filename);
			fs.writeFileSync(destinationPath, contentString);
			console.log(
				`✅ JSON file written to ${destinationPath} with ${filename}`,
			);
		}

		// return the output
		return output;
	}

	/**
	 * Process a PO file and return the JSON data.
	 * @param file - The path to the PO file.
	 * @param script - The script to be translated.
	 * @param encoding - The encoding of the PO file.
	 */
	public processFile(
		file: string,
		script: string,
		encoding: BufferEncoding = "utf8",
	): MakeJson {
		// Get the file path
		const filePath = path.join(this.destination, file);

		// Read the source file
		const content = fs.readFileSync(filePath, encoding) as string;

		// Parse the source file
		const poContent = this.parsePoFile(content);

		if (this.stripUnused) {
			// get the strings used in the script
			const scriptContent = this.parseScript(script);

		// compare the strings used in the script with the strings in the po file
		const stringsNotInPoFile = this.compareStrings(
			scriptContent.blocks,
			poContent,
		);

			if (!stringsNotInPoFile) {
				return null;
			}

			// replace the po file strings with the strings used in the script
			poContent.translations = stringsNotInPoFile.translations;
		}

		// Convert to Jed json dataset
		return this.convertToJed(
			poContent.headers,
			poContent.translations,
			script,
			this.extractIsoCode(filePath), // extract the ISO code from the po filename
		);
	}

	/**
	 * Takes a PO file and returns the header and translations.
	 * @param content - The content of the PO file.
	 * @private
	 *
	 * @returns An object containing the header and translations.
	 */
	private parsePoFile(content: string): GetTextTranslations {
		return po.parse(content);
	}

	/**
	 * Converts PO data to Jed data.
	 * @param header - The header of the PO file.
	 * @param translations - The translations of the PO file.
	 * @param source - The source of the PO file.
	 * @param languageIsoCode - The ISO code of the language.
	 * @private
	 *
	 * @return An object containing the Jed data.
	 */
	private convertToJed(
		header: Record<string, string>,
		translations: {
			[msgctxt: string]: { [msgId: string]: GetTextTranslation };
		},
		source: string,
		languageIsoCode?: string,
	): MakeJson {
		const packageJson = getPkgJsonData(modulePath, "name", "version") as {
			name: string;
			version: string;
		};

		// Domain name to use for the Jed format
		const domain = "messages";

		const generator = `${packageJson.name}/${packageJson.version}`;

		// Initialize the Jed-compatible structure
		const jedData: JedData = {
			[domain]: {
				"": {
					domain: domain,
					lang: languageIsoCode || header.Language || "en",
					plural_forms:
						header["Plural-Forms"] || "nplurals=2; plural=(n != 1);",
				},
			},
		};

		// Process all translations
		for (const msgctxt of Object.keys(translations)) {
			const contextTranslations = translations[msgctxt];

			for (const msgid of Object.keys(contextTranslations)) {
				const translation = contextTranslations[msgid];

				// Skip empty msgid (header) as we've already handled it
				if (msgid === "") continue;

				// Construct the key using context if available
				const key =
					msgctxt && msgctxt !== "" ? `${msgctxt}\u0004${msgid}` : msgid;

				// Add the translation to the Jed data structure
				jedData[domain][key] = translation.msgstr;
			}
		}

		const makeJson: {
			domain: string;
			generator: string;
			"translation-revision-date": string;
			source: string;
			locale_data: JedData;
		} = {
			"translation-revision-date": new Date().toISOString(),
			generator: generator,
			source: path.join(this.sourceDir, source).replace(/\\/g, "/"),
			domain,
			locale_data: jedData,
		};

		return makeJson as MakeJson;
	}

	/**
	 * Gets the ISO code from the filename.
	 * @param filename The filename to extract the ISO code from.
	 * @private
	 *
	 * @returns The ISO code if found, otherwise null.
	 */
	private extractIsoCode(filename: string): string | undefined {
		const match = filename.match(IsoCodeRegex);
		return match ? match[1] : undefined;
	}

	/**
	 * Takes the header content and extracts the plural forms.
	 * @param headerContent - The header content to extract the plural forms from.
	 * @private
	 *
	 * @returns The plural forms extracted from the header. Defaults to 'nplurals=2; plural=(n != 1);' if not found
	 */
	private getPluralForms(headerContent: string): string {
		const match = headerContent.match(/Plural-Forms:\s*(.*?)\n/);
		return match ? match[1] : "nplurals=2; plural=(n != 1);";
	}

	/**
	 * Takes the header content and extracts the language.
	 * @param headerContent - The header content to extract the language from.
	 * @private
	 *
	 * @returns The language code extracted from the header.
	 */
	private getLanguage(headerContent: string): string {
		const match = headerContent.match(/Language:\s*(.*?)\n/);
		return match ? match[1] : defaultLocale;
	}

	/**
	 * Checks if the given files are compatible with the allowed formats.
	 * @param files The files array to check.
	 * @private
	 *
	 * @returns True if the files are compatible, false otherwise.
	 */
	private isCompatibleFile(files: string[]): boolean {
		if (!this.allowedFormats) return true;
		return files.some((file) =>
			this.allowedFormats.some((format) => file.endsWith(format)),
		);
	}

	private md5(text: string): string {
		return crypto.createHash("md5").update(text).digest("hex");
	}

	private generateFilename(script: string, file: string): string {
		const scriptName = this.md5(script);
		//build the filename for the json file using the po files
		return file.replace(".po", `-${scriptName}.json`);
	}

	/**
	 * Adds a script to the output object.
	 * @private
	 *
	 * @param potFile - The pot file to parse.
	 * @param script - The script to add.
	 * @return {Record<string, JedData>} - The output object.
	 * */
	private addPot(
		potFile: string,
		script: string,
	): { filename: string; data: MakeJson } {
		const filename = this.generateFilename(
			path.join(this.source, script).replace(/\\/g, "/"),
			potFile,
		);
		// the processed file is added to the output object
		return {
			filename,
			data: this.processFile(potFile, script),
		};
	}

	/**
	 * Compares the strings used in the script with the strings in the po file.
	 * @param jsArray - The strings used in the script.
	 * @param poObject - The content of the po file.
	 * @private
	 */
	private compareStrings(
		jsArray: SetOfBlocks["blocks"],
		poObject: GetTextTranslations,
	) {
		// The copy of the po file with only the strings used in the script
		const filteredPo = {
			charset: poObject.charset,
			headers: { ...poObject.headers },
			translations: { "": {} },
		};

		// copy the original header
		if (poObject.translations[""][""]) {
			filteredPo.translations[""][""] = { ...poObject.translations[""][""] };
		}

		// Create a set of message ids from the JS file
		const jsMessageIds = new Set(jsArray.map((item) => item.msgid));

		// Iterate over the po file and keep only the strings used in the script
		for (const domain in poObject.translations) {
			if (domain !== "") continue; // handle only the main domain

			for (const msgid in poObject.translations[domain]) {
				if (msgid === "") continue; // Skip the header

				if (jsMessageIds.has(msgid)) {
					// ok the msgid is used
					if (!filteredPo.translations[domain]) {
						filteredPo.translations[domain] = {};
					}
					filteredPo.translations[domain][msgid] = {
						...poObject.translations[domain][msgid],
					};
				}
			}
		}

		// check if the po file is empty, 1 means that the header is the only string available
		// TODO: if the json file is empty, we should delete it?
		if (Object.keys(filteredPo.translations[""]).length <= 1) {
			return null;
		}

		return filteredPo;
	}

	private parseScript(script: string): SetOfBlocks {
		const fileContent = fs.readFileSync(path.join(this.source, script), "utf8");
		const transformedScript = transformSync(fileContent, {
			configFile: false,
			presets: ["@babel/preset-env"],
			compact: false,
			comments: true,
			sourceMaps: false,
			plugins: [
				({ types: t }) => ({
					visitor: {
						CallExpression(path) {
							const callee = path.node.callee;

							// Check for pattern like: (fn)("...")
							if (
								t.isSequenceExpression(callee) &&
								t.isMemberExpression(callee.expressions[1])
							) {
								const property = callee.expressions[1].property;

								if (
									t.isIdentifier(property) &&
									allowedFunctions.has(property.name)
								) {
									// Replace with direct function call: __("..."), _n(...), etc.
									path.node.callee = t.identifier(property.name);
								}
							}
						},
					},
				}),
			],
		}).code as string;

		return doTree(transformedScript, script);
	}
}

export default MakeJsonCommand;
