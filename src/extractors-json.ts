import type { TranslationString } from './types'
import { extractNames, yieldParsedData } from './extractors'
import path from 'path'
import { readFileSync } from 'fs'
import { SingleBar } from 'cli-progress'
import { blockJson, themeJson } from './extractors-maps'

export function parseJsonFile(args: {
	filepath: string
	stats?: { bar: SingleBar; index: number }
}) {
	const filename = path.basename(args.filepath)
	let parsed: Record<string, string | string[]> | null = null
	// parse the file based on the filename
	switch (filename) {
		case 'block.json':
			args.stats?.bar.increment(0, { filename: 'Parsing block.json' })
			parsed = parseBlockJson(readFileSync(path.resolve(args.filepath), 'utf8'))
			break
		case 'theme.json':
			args.stats?.bar.increment(0, { filename: 'Parsing theme.json' })
			parsed = parseThemeJson(readFileSync(path.resolve(args.filepath), 'utf8'))
			break
	}

	if (parsed !== null) {
		// extract the strings from the file and return them as an array of objects
		return yieldParsedData(parsed, filename, args)
	}
}

/**
 * Parses a JSON string and returns a record with the extracted data.
 *
 * @param {string} jsondata - The JSON string to parse.
 * @return {Record<string, any>} - A record containing the extracted data.
 */
export function parseBlockJson(jsondata: string): Record<string, any> {
	const json = JSON.parse(jsondata)
	return {
		title: json?.title ?? undefined,
		description: json?.description ?? undefined,
		keywords: json?.keywords ?? undefined,
		styles: json?.styles ? extractNames(json.styles) : undefined,
		variations:
			json?.variations?.map((variation: any) => ({
				title: variation?.title ?? undefined,
				description: variation?.description ?? undefined,
				keywords: variation?.keywords ?? undefined,
			})) ?? undefined,
	}
}

/**
 * Parses a JSON string into a theme object.
 *
 * @param {string} jsondata - The JSON string to parse.
 * @return {Record<string, any>} - The parsed theme object.
 */
export function parseThemeJson(jsondata: string): Record<string, any> {
	const json = JSON.parse(jsondata)

	const settings = json.settings
	const typography = settings?.typography || {}
	const color = settings?.color || {}
	const spacing = settings?.spacing || {}
	const blocks = settings?.blocks || {}

	return {
		title: json.title,
		settings: {
			typography: {
				fontSizes: typography.fontSizes ? extractNames(typography.fontSizes) : [],
				fontFamilies: typography.fontFamilies ? extractNames(typography.fontFamilies) : [],
			},
			color: {
				palette: color.palette ? extractNames(color.palette) : [],
				gradients: color.gradients ? extractNames(color.gradients) : [],
				duotone: color.duotone ? extractNames(color.duotone) : [],
			},
			spacing: {
				spacingSizes: spacing.spacingSizes ? extractNames(spacing.spacingSizes) : [],
			},
			blocks: Object.keys(blocks).reduce((acc: any, key: string) => {
				const block = blocks[key]
				acc[key] = {
					typography: {
						fontSizes: block.typography?.fontSizes
							? extractNames(block.typography.fontSizes)
							: [],
						fontFamilies: block.typography?.fontFamilies
							? extractNames(block.typography.fontFamilies)
							: [],
					},
					color: {
						palette: block.color?.palette ? extractNames(block.color.palette) : [],
						gradients: block.color?.gradients
							? extractNames(block.color.gradients)
							: [],
					},
					spacing: {
						spacingSizes: block.spacing?.spacingSizes
							? extractNames(block.spacing.spacingSizes)
							: [],
					},
				}
				return acc
			}, {}),
		},
		customTemplates: json.customTemplates
			? json.customTemplates.map((template: any) => template.title)
			: [],
		templateParts: json.templateParts
			? json.templateParts.map((templatePart: any) => templatePart.title)
			: [],
	}
}

/**
 * Retrieves the comment associated with the given key from the specified JSON file.
 *
 * @param {string} key - The key used to retrieve the comment.
 * @param {('block.json' | 'theme.json')=} type - The type of JSON file to search for the comment. Defaults to 'block.json'.
 * @return {string} - The comment associated with the given key. If the key is not found, the key itself is returned.
 */
export function getJsonComment(key: string, type?: 'block.json' | 'theme.json'): string {
	const comments = type === 'block.json' ? blockJson : themeJson
	return key in Object.values(comments) ? comments[key as keyof typeof comments] : key
}

/**
 * Generates a JSON string for a given key, data, path, and optional type.
 *
 * @param {string} key - The key for the translation string.
 * @param {string} data - The data for the translation string.
 * @param {string} path - The path of the translation string.
 * @param {'block.json' | 'theme.json'} [type] - The optional type of the translation string.
 * @return {TranslationString} The generated translation string.
 */
export function jsonString(
	key: string,
	data: string,
	path: string,
	type?: 'block.json' | 'theme.json'
): TranslationString {
	return {
		reference: `#: ${path}`,
		type: 'msgid',
		raw: [key, data],
		msgid: data,
		msgctxt: getJsonComment(key, type),
	}
}
