import fs from "node:fs";
import path from "node:path";
import type { SetOfBlocks } from "gettext-merger";
import { blockJson, pkgJsonHeaders, themeJson } from "../const.js";
import type { Args, I18nSchema } from "../types.js";
import { JsonSchemaExtractor } from "./schema.js";
import { yieldParsedData } from "./utils.js";

/**
 * Parses a JSON file and returns an array of parsed data.
 *
 * @param {Object} opts - The arguments for parsing the JSON file.
 * @param {string} opts.filepath - The filepath of the JSON file to parse.
 * @param {Object} [opts.stats] - Optional statistics object.
 * @param {number} opts.stats.index - The index of the progress bar.
 * @return {Promise<TranslationStrings>} A promise that resolves to an object containing the parsed data.
 */
export async function parseJsonFile(opts: {
	fileContent: string;
	filename: "block.json" | "theme.json";
	filepath: string;
}): Promise<I18nSchema> {
	const jsonTranslations = await JsonSchemaExtractor.fromString(
		opts.fileContent,
		{
			file: opts.filename,
			schema:
				opts.filename === "theme.json"
					? JsonSchemaExtractor.themeJsonSource
					: JsonSchemaExtractor.blockJsonSource,
			schemaFallback:
				opts.filename === "theme.json"
					? JsonSchemaExtractor.themeJsonFallback
					: JsonSchemaExtractor.blockJsonFallback,
			addReferences: true,
		} as { schema?: string; schemaFallback?: I18nSchema },
	);
	return jsonTranslations ?? {};
}

function getSchema(type?: string) {
	switch (type) {
		case "block.json":
			return blockJson;
		case "theme.json":
			return themeJson;
		default:
			return {};
	}
}

/**
 * Retrieves the comment associated with the given key from the specified JSON file.
 *
 * @param {string} key - The key used to retrieve the comment.
 * @param {string=} type - The type of JSON file to search for the comment. Defaults to 'block.json'.
 * @return {string} - The comment associated with the given key. If the key is not found, the key itself is returned.
 */
export function getJsonComment(key: string, type?: string): string {
	const comments = getSchema(type);
	return key in Object.values(comments)
		? comments[key as keyof typeof comments]
		: key;
}

/**
 * Extracts package data from the given arguments and returns a record
 * containing the specified fields from the package.json file.
 *
 * @param {Args} args - The arguments for extracting package data.
 *
 * @return {Record<string, string>} - A record containing the extracted package data.
 */
export function extractPackageJson(args: Args): Record<string, string> {
	const fields = pkgJsonHeaders;
	const pkgJsonMeta: Record<string, string> = {};
	// read the package.json file
	const packageJsonPath = args.paths.cwd
		? path.join(args.paths.cwd, "package.json")
		: "package.json";

	/**
	 *  check if the package.json extract the fields from the package.json file
	 */
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
		for (const field of Object.keys(fields)) {
			// if the field exists in the package.json
			if (field in packageJson) {
				pkgJsonMeta[field] = packageJson[field] as string;
			}
		}
	}
	return pkgJsonMeta;
}

/**
 * Parses the JSON content of a file based on the filename and file content.
 *
 * @param {string} fileContent - The content of the file to parse.
 * @param {string} filePath - The path of the file being parsed.
 * @param {'block.json' | 'theme.json'} filename - The type of JSON file being parsed.
 * @return {Promise<TranslationStrings>} The parsed translation strings.
 */
export async function parseJsonCallback(
	fileContent: string,
	filePath: string,
	filename: "block.json" | "theme.json",
): Promise<SetOfBlocks> {
	const data = await parseJsonFile({
		fileContent: fileContent,
		filename: filename,
		filepath: filePath,
	});

	return yieldParsedData(
		data as Record<string, string | string[]>,
		filename,
		path.join(filePath, filename),
	);
}
