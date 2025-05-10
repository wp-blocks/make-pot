import crypto from "node:crypto";
import * as fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import { IsoCodeRegex, defaultLocale, fileRegex } from "../const";
import type { JedData, MakeJsonArgs } from "../types";

export class MakeJsonCommand {
	/**
	 * Pretty print JSON.
	 * @private
	 */
	private readonly source: string;
	/**
	 * The destination file path.
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
	private scriptName: string;

	public constructor(args: MakeJsonArgs) {
		if (!args.source) {
			throw new Error("No source directory specified");
		}

		if (!fs.existsSync(args.source)) {
			throw new Error("Source directory not found");
		}

		this.scriptName = this.md5(args.scriptName || "index.js");
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
	}

	/**
	 * The main function. Parses the PO files and generates the JSON files.
	 */
	public async invoke(): Promise<Record<string, JedData>> {
		// get all the files in the source directory
		const files = await glob("**/*.po", { cwd: this.source, nodir: true });

		// get all the po files
		const output: Record<string, JedData> = {};
		for (const file of files) {
			//build the filename for the json file using the po files
			const jsonFilename = file.replace(".po", `-${this.scriptName}.json`);
			// build the output object
			output[jsonFilename] = this.processFile(path.join(this.source, file));
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

			fs.writeFileSync(path.join(this.destination, filename), contentString);
			console.log(`JSON file written to ${this.destination + filename}`);
		}

		// return the output
		return output;
	}

	/**
	 * Process a PO file and return the JSON data.
	 * @param filePath - The path to the PO file.
	 */
	public processFile(filePath: string): JedData {
		// Read the source file
		const content = fs.readFileSync(filePath, "utf8");

		const languageIsoCode = this.extractIsoCode(filePath);

		// Parse the source file
		const { header, translations } = this.parsePoFile(content);

		// Convert to Jed json dataset
		return this.convertToJed(header, translations, languageIsoCode);
	}

	/**
	 * Takes a PO file and returns the header and translations.
	 * @param content - The content of the PO file.
	 * @private
	 *
	 * @returns An object containing the header and translations.
	 */
	private parsePoFile(content: string): {
		header: string;
		translations: Record<string, string[]>;
	} {
		const lines = content.split("\n");
		const translations: Record<string, string[]> = {};
		let header = "";
		let currentMsgid = "";
		let currentMsgstr: string[] = [];
		let currentFiles: string[] = [];
		let i = 0;

		// Trim empty lines at the beginning
		while (i < lines.length && lines[i].trim() === "") {
			i++;
		}

		// Ensure we start with 'msgid "'
		if (
			i < lines.length &&
			(!lines[i].startsWith('msgid "') || !lines[i].startsWith("#"))
		) {
			console.error(
				"Invalid PO file format: expected 'msgid \"' at the start of the header",
			);
		}

		// Parse header lines until we find the first 'msgid ""' and the first 'msgstr ""' or until we reach the end of the file
		while (i < lines.length && lines[i].trim() !== "") {
			if (
				lines[i].startsWith("msgid") ||
				lines[i].startsWith("msgstr") ||
				lines[i].startsWith("#")
			) {
				i++;
				continue;
			}
			if (lines[i].startsWith('"') && lines[i].endsWith('"')) {
				header += `${lines[i].slice(1, -1)}\n`;
			}
			i++;
		}

		// Skip the empty line
		i++;

		// Parse translations
		for (; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line.startsWith("#: ")) {
				if (line.startsWith("#: ")) {
					const match = line.match(fileRegex);
					if (typeof match?.[1] === "string") {
						const string = match[1].trim();
						currentFiles.push(string);
					}
				}
			} else if (line.startsWith('msgid "')) {
				if (
					currentMsgid &&
					currentMsgstr &&
					this.isCompatibleFile(currentFiles)
				) {
					translations[currentMsgid] = currentMsgstr;
				}
				currentMsgid = line.slice(7, -1);
				currentMsgstr = [];
				currentFiles = [];
			} else if (line.startsWith('msgstr "')) {
				currentMsgstr.push(line.slice(8, -1));
			} else if (line.startsWith('"') && line.endsWith('"')) {
				currentMsgstr.push(line.slice(1, -1));
			}
		}

		// Add the last translation if exists and is compatible
		if (
			currentMsgid &&
			currentMsgstr.length &&
			this.isCompatibleFile(currentFiles)
		) {
			translations[currentMsgid] = currentMsgstr;
		}

		return { header, translations };
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
		header: string,
		translations: Record<string, string[]>,
		languageIsoCode?: string,
	): JedData {
		console.log("Found translations:", Object.keys(translations).length);
		return {
			domain: "messages",
			locale_data: {
				messages: {
					"": {
						domain: "messages",
						plural_forms: this.getPluralForms(header),
						lang: languageIsoCode || this.getLanguage(header),
					},
					...translations,
				},
			},
		};
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
}

export default MakeJsonCommand;
