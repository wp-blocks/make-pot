import type { JsonData, TranslationStrings } from './types'
import { yieldParsedData } from './extractors'
import { BlockJson, blockJson, ThemeJson, themeJson } from './extractors-maps'
import { GetTextComment, GetTextTranslation } from 'gettext-parser'

/**
 * Finds values in a JSON object based on a given block.
 *
 * @param {T extends BlockJson} block - The block to search for values in the JSON.
 * @param {JsonData | ThemeJson} jsonData - The JSON object to search in.
 * @return {Record<string, any>} - The found values in a record.
 */
function findValuesInJson<T extends BlockJson>(
	block: T,
	jsonData: JsonData | ThemeJson
): Record<string, any> {
	const result: Record<string, any> = {}

	// Helper function to recursively search for values in JSON
	const searchValues = (block: T, json: JsonData) => {
		for (const key in block) {
			if (typeof block[key] === 'object') {
				if (typeof json[key] === 'object') {
					// @ts-ignore
					searchValues(block[key], json[key])
				}
			} else if (json[key] !== undefined) {
				result[key] = json[key]
			}
		}
	}

	searchValues(block, jsonData)

	return result
}

/**
 * Parses a JSON file and returns an array of parsed data.
 *
 * @param {Object} opts - The arguments for parsing the JSON file.
 * @param {string} opts.filepath - The filepath of the JSON file to parse.
 * @param {Object} [opts.stats] - Optional statistics object.
 * @param {number} opts.stats.index - The index of the progress bar.
 * @return {Promise<TranslationStrings>} A promise that resolves to an object containing the parsed data.
 */
export function parseJsonFile(opts: {
	sourceCode: string
	filename: 'block.json' | 'theme.json'
	filepath: string
}): TranslationStrings {
	let parsed: Record<string, string> | null = null
	const JsonData = JSON.parse(opts.sourceCode)
	// parse the file based on the filename
	parsed = findValuesInJson(
		JsonData,
		opts.filename === 'block.json' ? blockJson : themeJson
	)

	if (parsed) {
		// extract the strings from the file and return them as an array of objects
		return yieldParsedData(parsed, opts.filename, opts.filepath)
	} else {
		return {}
	}
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
	type?: 'block.json' | 'theme.json'
): string {
	const comments = type === 'block.json' ? blockJson : themeJson
	return key in Object.values(comments)
		? comments[key as keyof typeof comments]
		: key
}

/**
 * Generates a JSON string for a given key, data, path, and optional type.
 *
 * @param {string} key - The key for the translation string.
 * @param {string} data - The data for the translation string.
 * @param {string} path - The path of the translation string.
 * @param {'block.json' | 'theme.json'} [type] - The optional type of the translation string.
 * @return {TranslationStrings} The generated translation string.
 */
export function jsonString(
	key: string,
	data: string,
	path: string,
	type?: 'block.json' | 'theme.json'
): GetTextTranslation {
	return {
		msgstr: [],
		msgid: getJsonComment(key, type),
		msgctxt: data,
		comments: {
			reference: `${path}`,
		} as GetTextComment,
	}
}
