import * as fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import type { MakeJsonArgs } from "../types";

interface JedData {
	domain: string;
	locale_data: Record<string, string[]>;
}

export class MakeJsonCommand {
	/**
	 * Pretty print JSON.
	 * @private
	 */
	private source: string;
	/**
	 * The destination file path.
	 * @private
	 */
	private destination: string;
	/**
	 * The allowed file extensions.
	 * @private
	 */
	private allowedFormats: string[] | null;
	/**
	 * Remove old POT files.
	 * @private
	 */
	private purge: boolean;
	/**
	 * Pretty print JSON.
	 * @private
	 */
	private prettyPrint: boolean;
	/**
	 * Enable debug mode.
	 * @private
	 */
	private debug: boolean;

	public constructor(args: MakeJsonArgs) {
		if (args.source === null) {
			throw new Error("No source file specified");
		}

		if (!fs.existsSync(args.source)) {
			throw new Error("Source file not found");
		}

		this.source = args.source;
		this.destination = args.destination;
		this.allowedFormats = args.allowedFormats ?? [
			".ts",
			".tsx",
			".js",
			".jsx",
			"mjs",
			"cjs",
		];
		this.purge = args.purge;
		this.prettyPrint = args.prettyPrint;
		this.debug = args.debug;
	}

	public async invoke(): Promise<Record<string, JedData>> {
		// get all the files in the source directory
		const files = await glob("**/*.po", { cwd: this.source, nodir: true });

		// get all the po files
		const output: Record<string, JedData> = {};
		for (const file of files) {
			//build the filename for the json file using the po files
			const jsonFilename = file.replace(".po", ".json");
			// build the output object
			output[jsonFilename] = this.processFile(file);
		}
		console.log(output);

		for (const key in output) {
			const [filename, content] = output[key];
			let contentString: string;
			if (this.purge) {
				fs.unlinkSync(path.join(this.source, filename));
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

	public processFile(filePath: string): JedData {
		// Read the source file
		const content = fs.readFileSync(filePath, "utf8");

		// Parse the source file
		const poData = this.parsePoFile(content);

		// Convert to Jed json dataset
		return this.convertToJed(poData, this.allowedFormats);
	}

	private parsePoFile(content: string): Record<string, string> {
		const lines = content.split("\n");
		const translations: Record<string, string> = {};
		let currentMsgid = "";
		let currentMsgstr = "";

		for (const line of lines) {
			if (line.startsWith('msgid "')) {
				if (currentMsgid && currentMsgstr) {
					translations[currentMsgid] = currentMsgstr;
				}
				currentMsgid = line.slice(7, -1);
				currentMsgstr = "";
			} else if (line.startsWith('msgstr "')) {
				currentMsgstr = line.slice(8, -1);
			} else if (line.startsWith('"') && line.endsWith('"')) {
				if (currentMsgstr) {
					currentMsgstr += line.slice(1, -1);
				} else {
					currentMsgid += line.slice(1, -1);
				}
			}
		}

		if (currentMsgid && currentMsgstr) {
			translations[currentMsgid] = currentMsgstr;
		}

		return translations;
	}

	private convertToJed(
		poData: Record<string, string>,
		allowedFormats: string[] | null,
	): JedData {
		const jedData: object = {
			domain: "messages",
			locale_data: {
				messages: {
					"": {
						domain: "messages",
						plural_forms: this.getPluralForms(poData[""]),
						lang: this.getLanguage(poData[""]),
					},
				},
			},
		};

		for (const [msgid, msgstr] of Object.entries(poData)) {
			if (msgid === "") continue;

			if (!allowedFormats || this.isCompatibleFile(msgid, allowedFormats)) {
				jedData.locale_data.messages[msgid] = [msgstr];
			}
		}

		return jedData;
	}

	private getPluralForms(headerContent: string): string {
		const match = headerContent.match(/Plural-Forms:\s*(.*?)\n/);
		return match ? match[1] : "nplurals=2; plural=(n != 1);";
	}

	private getLanguage(headerContent: string): string {
		const match = headerContent.match(/Language:\s*(.*?)\n/);
		return match ? match[1] : "en";
	}

	private isCompatibleFile(msgid: string, allowedFormats: string[]): boolean {
		if (Array.isArray(allowedFormats)) {
			return allowedFormats.some((ext) => msgid.includes(ext));
		}
		return true;
	}

	private md5(text: string): string {
		return crypto.createHash("md5").update(text).digest("hex");
	}
}

export default MakeJsonCommand;
