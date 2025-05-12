import fs, { writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Args } from "../types";

/**
 * Ensures that a folder exists at the specified path.
 *
 * @param {string | undefined} folderPath - The path of the folder to ensure existence for.
 * @return {string} - The path of the folder, or '.' if folderPath is undefined.
 */
function ensureFolderExists(folderPath: string | undefined): string {
	if (folderPath === undefined) {
		return ".";
	}
	try {
		// Check if the folder exists
		fs.accessSync(
			path.resolve(folderPath),
			fs.constants.R_OK | fs.constants.W_OK,
		);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			// The Folder does not exist, so create it
			fs.mkdirSync(folderPath, { recursive: true });
			console.log(`Folder created: ${folderPath}`);
			return folderPath;
		}
	}
	return folderPath;
}

/**
 * Gets the charset of the .pot file
 *
 * @param charset the charset of the .pot file
 * @return the charset of the .pot file
 */
export function getCharset(charset: string | undefined): BufferEncoding {
	if (!charset) {
		return "latin1";
	}
	// we need to check if the charset is valid otherwise we return latin1 that is a common alias for ISO-8859-1 and the default charset for pot files
	switch (charset.toLowerCase()) {
		case "utf-8":
			return "utf-8";
		default:
			return "latin1";
	}
}

export function getEncodingCharset(charset: string | undefined): string {
	if (!charset) {
		return "iso-8859-1";
	}
	// we need to check if the charset is valid otherwise we return utf-8 that is a common alias for ISO-8859-1 and the default charset for pot files
	switch (charset.toLowerCase()) {
		case "utf-8":
			return "utf-8";
		default:
			return "iso-8859-1";
	}
}

/**
 * The output path for the pot file.
 * @param outpath - the output path for the pot/json files
 * @return {string} - the output path
 */
export function getOutputPath(outpath?: string): string {
	return path.join(process.cwd(), outpath ?? "languages");
}

/**
 * The output path for the pot file.
 * @param args - the command line arguments
 */
function getOutputFilePath(args: Args): string {
	const { out, headers, options } = args.paths;
	let i18nFolder = out ?? headers?.domainPath ?? "languages";

	// Remove leading and trailing slashes
	i18nFolder = i18nFolder.replace(/^\/+|\/+$/g, "");

	const extension = options?.json ? "json" : "pot";

	return path.join(process.cwd(), i18nFolder, `${args.slug}.${extension}`);
}

/**
 * Writes the .pot file to disk
 *
 * @param fileContent the content of the .pot file
 * @param args the command line arguments passed to the program
 */
export function writeFile(fileContent: string, args: Args): void {
	const dest = getOutputFilePath(args);

	if (ensureFolderExists(path.dirname(dest))) {
		// get the encoding charset
		const encodingCharset = getCharset(args.options?.charset);
		console.log(`File created at ${dest}`);

		// write the file
		const potBuffer = Buffer.from(fileContent);
		writeFileSync(dest, potBuffer.toString(encodingCharset), {
			encoding: encodingCharset,
		});
	} else {
		console.log(`Folder ${dest} does not exist and cannot be created`);
	}
}

/**
 * The async version of fs.readFile method
 * @param path the path of the file to read
 * @return the content of the file as a string
 */
export async function readFileAsync(path: string): Promise<string> {
	return readFile(path, "utf-8");
}
