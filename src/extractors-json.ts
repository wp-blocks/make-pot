import type { JsonData, TranslationStrings } from './types'
import { extractNames, yieldParsedData } from './extractors'
import path from 'path'
import { readFileSync } from 'fs'
import { SingleBar } from 'cli-progress'
import { BlockJson, blockJson, ThemeJson, themeJson } from './extractors-maps'
import { GetTextComment, GetTextTranslation } from 'gettext-parser'

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

export function parseJsonFile(args: {
	filepath: string
	stats?: { bar: SingleBar; index: number }
}) {
	const filename = path.basename(args.filepath)
	let parsed: Record<string, string> | null = null
	// parse the file based on the filename
	switch (filename) {
		case 'block.json':
			args.stats?.bar.increment(0, { filename: 'Parsing block.json' })
			parsed = findValuesInJson(
				JSON.parse(readFileSync(args.filepath, 'utf8')),
				blockJson
			)
			break
		case 'theme.json':
			args.stats?.bar.increment(0, { filename: 'Parsing theme.json' })
			parsed = findValuesInJson(
				JSON.parse(readFileSync(args.filepath, 'utf8')),
				themeJson
			)
			break
	}

	if (parsed) {
		// extract the strings from the file and return them as an array of objects
		return yieldParsedData(parsed, filename, args)
	}

	return new Promise<TranslationStrings>((resolve) => resolve({}))
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
