import path from "node:path";
import type { Block, SetOfBlocks } from "gettext-merger";
import type { I18nSchema } from "../types.js";
import { yieldParsedData } from "../utils/extractors.js";
import { JsonSchemaExtractor } from "./schema.js";

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
}): Promise<Block[]> {
	const isTheme = opts.filename === "theme.json";
	const schema: { url: string; fallback: I18nSchema } = {
		url: isTheme
			? JsonSchemaExtractor.themeJsonSource
			: JsonSchemaExtractor.blockJsonSource,
		fallback: isTheme
			? (JsonSchemaExtractor.themeJsonFallback as I18nSchema)
			: (JsonSchemaExtractor.blockJsonFallback as I18nSchema),
	};

	if (!schema.url || !schema.fallback) {
		console.error("Schema URL or fallback not provided");
		return;
	}

	// Get the JSON translations from the schema
	const jsonTranslations = await JsonSchemaExtractor.parse(
		opts.fileContent,
		schema,
		{
			file: opts.filename,
			addReferences: true,
		},
	);

	return jsonTranslations ?? [];
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
	});

	return yieldParsedData(data, filename, path.join(filePath, filename));
}
