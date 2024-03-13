import type { I18nSchema } from '../types'
import { blockJson, themeJson } from '../maps'
import { JsonSchemaExtractor } from './schema'

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
	sourceCode: string
	filename: 'block.json' | 'theme.json'
	filepath: string
}): Promise<I18nSchema> {
	const jsonTranslations = await JsonSchemaExtractor.fromString(
		opts.sourceCode,
		{
			file: opts.filename,
			schema:
				opts.filename === 'theme.json'
					? JsonSchemaExtractor.themeJsonSource
					: JsonSchemaExtractor.blockJsonSource,
			schemaFallback:
				opts.filename === 'theme.json'
					? JsonSchemaExtractor.themeJsonFallback
					: JsonSchemaExtractor.blockJsonFallback,
			addReferences: true,
		}
	)
	return jsonTranslations ?? {}
}

/**
 * Retrieves the comment associated with the given key from the specified JSON file.
 *
 * @param {string} key - The key used to retrieve the comment.
 * @param {('block.json' | 'theme.json')=} type - The type of JSON file to search for the comment. Defaults to 'block.json'.
 * @return {string} - The comment associated with the given key. If the key is not found, the key itself is returned.
 */
export function getJsonComment(
	key: string,
	type?: 'block.json' | 'theme.json' | 'readme.txt'
): string {
	const comments = type === 'block.json' ? blockJson : themeJson
	return key in Object.values(comments)
		? comments[key as keyof typeof comments]
		: key
}
