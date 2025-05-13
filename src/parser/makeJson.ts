import crypto from "node:crypto";
import * as fs from "node:fs";
import path from "node:path";
import {
	type GetTextTranslation,
	type GetTextTranslations,
	po,
} from "gettext-parser";
import { glob } from "glob";
import { IsoCodeRegex, defaultLocale } from "../const";
import type { JedData, MakeJsonArgs } from "../types";

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
	private sourceDir: string;
	public constructor(args: MakeJsonArgs) {
		this.sourceDir = path.relative(args.paths.cwd, args.source ?? "");
		if (!fs.existsSync(this.sourceDir)) {
			console.error("Source directory not found", args);
			throw new Error(`Source directory ${this.sourceDir} not found`);
		}

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
	public async invoke(): Promise<Record<string, JedData>> {
		// get all the files in the source directory
		const files = await glob("**/*.po", { cwd: this.destination, nodir: true });

		console.log("Found po files", files, "in", this.destination, "folder");

		// get all the po files
		const output: Record<string, JedData> = {};
		for (const file of files) {
			if (!this.scriptName) {
				this.scriptName = await glob("*.js", {
					cwd: this.source,
					nodir: true,
				});
				console.log(
					"Found script:",
					this.scriptName,
					"in",
					this.source,
					"folder",
				);
			}

			if (typeof this.scriptName === "string") {
				const pot = this.addPot(file, this.scriptName);
				output[pot.filename] = pot.data;
			} else if (Array.isArray(this.scriptName)) {
				for (const script of this.scriptName) {
					const pot = this.addPot(file, script);
					output[pot.filename] = pot.data;
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
			console.log(`JSON file written to ${destinationPath} with ${filename}`);
		}

		// return the output
		return output;
	}

	/**
	 * Process a PO file and return the JSON data.
	 * @param filePath - The path to the PO file.
	 * @param encoding - The encoding of the PO file.
	 */
	public processFile(
		filePath: string,
		encoding: BufferEncoding = "utf8",
	): JedData {
		// Read the source file
		const content = fs.readFileSync(filePath, encoding) as string;

		const languageIsoCode = this.extractIsoCode(filePath);

		// Parse the source file
		const poContent = this.parsePoFile(content);

		// Convert to Jed json dataset
		return this.convertToJed(
			poContent.headers,
			poContent.translations,
			languageIsoCode,
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
		languageIsoCode?: string,
	): JedData {
		// Domain name to use for the Jed format
		const domain = "messages";

		// Initialize the Jed-compatible structure
		const jedData = {
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

		return jedData as JedData;
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

	/**
	 * Adds a script to the output object.
	 * @private
	 *
	 * @param file - The pot file to parse.
	 * @param script - The script to add.
	 * @return {Record<string, JedData>} - The output object.
	 * */
	private addPot(
		file: string,
		script: string,
	): { filename: string; data: JedData } {
		const scriptName = this.md5(script);
		//build the filename for the json file using the po files
		const jsonFilename = file.replace(".po", `-${scriptName}.json`);
		// build the output object
		return {
			filename: jsonFilename,
			data: this.processFile(path.join(this.destination, file)),
		};
	}
}

export default MakeJsonCommand;
