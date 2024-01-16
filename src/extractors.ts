import path from 'path'
import fs, { readFileSync } from 'fs'
import { type Args, type TranslationString } from './types'
import { pkgJsonHeaders } from './const'
import { getCommentBlock } from './utils'
import Parser from 'tree-sitter'
import type { SingleBar } from 'cli-progress'
import { jsonString, parseJsonFile } from './extractors-json'
import { parsePHPFile } from './extractors-php'
import { extractStrings } from './tree'
import { extractFileData } from './extractors-text'

/**
 * Extracts the names from an array of items.
 *
 * @param {unknown[]} items - The array of items.
 * @return {string[]} An array of names extracted from the items.
 */
export const extractNames = (items: { name: string }[]): string[] => items.map((item) => item.name)

/**
 * Extracts strings from parsed JSON data.
 *
 * @param {Record<string, any> | Parser.SyntaxNode} parsed - The parsed JSON data or syntax node.
 * @param {string | Parser} filename - The filename or parser.
 * @param opts - The metadata of this translation string.
 * @return {TranslationString[]} An array of translation strings.
 */
export function yieldParsedData(
	parsed: Record<string, string | string[]> | Parser.SyntaxNode,
	filename: string | Parser,
	opts: { filepath: string; stats?: { bar: SingleBar } }
): Promise<TranslationString[]> {
	return new Promise<TranslationString[]>((resolve) =>
		resolve(
			Object.entries(parsed as Record<string, string | string[]>)

				// return the translations for each key in the json data
				.map(([key, jsonData]) => {
					// if is a string return a single json string
					if (typeof jsonData === 'string') {
						return jsonString(
							key,
							jsonData,
							opts.filepath,
							filename as 'block.json' | 'theme.json'
						)
					} else {
						opts.stats?.bar.increment(0, { filename: 'not a string' })
					}

					if (!jsonData) {
						opts.stats?.bar.increment(0, {
							filename: `Skipping ${key} in ${opts.filepath} as ${filename} ... cannot parse data`,
						})

						return null
					}

					// if is an object return an array of json strings
					Object.entries(jsonData).map(([k, v]) => jsonString(k, v, opts.filepath))
				})
				.flat() as TranslationString[]
		)
	)
}

/**
 * Parses the source code using the specified language parser and extracts the strings from the file.
 *
 * @param {string} sourceCode - The source code to be parsed.
 * @param {Args} language - The language to be used for parsing.
 * @param {string} filepath - The path to the file being parsed.
 * @return {TranslationString[]} An array of translation strings.
 */
export function doTree(sourceCode: string, language: Parser, filepath: string) {
	// set up the parser
	const parser = new Parser()
	parser.setLanguage(language)

	// parse the file
	const tree = parser.parse(sourceCode) // Assuming parse is an async operation

	// extract the strings from the file and return them
	return extractStrings(tree.rootNode, language, filepath)
}

/**
 * Parse a file and extract strings asynchronously
 *
 * @param {object} args
 * @param {string} args.filepath - Path to the file to parse
 * @param {Parser|null} args.language - Language of the file to parse
 * @return {Promise<TranslationString[]>}
 */
export async function parseFile(args: {
	filepath: string
	language: Parser | string
}): Promise<TranslationString[] | null> {
	// check if the language is supported
	if (typeof args.language === 'string') {
		if (args.language === 'json') {
			return parseJsonFile(args) || []
		}
		console.log(`Skipping ${args.filepath}... No parser found for ${args.language} file`)
		return null
	}

	// read the file
	const sourceCode = readFileSync(path.resolve(args.filepath), 'utf8')

	// set up the parser
	const parser = new Parser()
	parser.setLanguage(args.language)

	// parse the file
	const tree = parser.parse(sourceCode) // Assuming parse is an async operation

	// extract the strings from the file and return them
	return extractStrings(tree.rootNode, args.language, args.filepath)
}

/**
 * Extracts package data from the given arguments and returns a record
 * containing the specified fields from the package.json file.
 *
 * @param {Args} args - The arguments for extracting package data.
 * @param {Record<string, string>} fields - The fields to extract from the package.json file. Default is pkgJsonHeaders.
 * @return {Record<string, string>} - A record containing the extracted package data.
 */
export function extractPackageData(args: Args, fields = pkgJsonHeaders): Record<string, string> {
	// TODO: package.json "files" could be used to get the file list
	const pkgJsonMeta: Record<string, string> = {}
	// read the package.json file
	const packageJsonPath = args.sourceDirectory
		? path.join(args.sourceDirectory, 'package.json')
		: 'package.json'
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
		// extract the fields from the package.json file
		for (const field of Object.keys(fields)) {
			if (packageJson[field] !== undefined) {
				pkgJsonMeta[field] = packageJson[field]
			}
		}
	}
	return pkgJsonMeta
}

/**
 * Extracts main file data based on the given arguments.
 *
 * @param {Args} args - The arguments for extracting the main file data.
 * @return {Record<string, string>} The extracted main file data.
 */
export function extractMainFileData(args: Args) {
	let fileData: Record<string, string> = {}
	const sourceDir = args.sourceDirectory
		? path.join(process.cwd(), args.sourceDirectory)
		: process.cwd()

	if (['plugin', 'block', 'generic'].includes(args.domain)) {
		const folderPhpFile = path.join(sourceDir, `${args.slug}.php`)

		if (fs.existsSync(folderPhpFile)) {
			const fileContent = fs.readFileSync(folderPhpFile, 'utf8')
			fileData = parsePHPFile(fileContent)

			if ('Plugin Name' in fileData) {
				console.log('Plugin file detected.')
				console.log(`Plugin file: ${folderPhpFile}`)
				args.domain = 'plugin'
			}
		} else {
			console.log('Plugin file not found.')
			console.log(`Missing Plugin filename: ${folderPhpFile}`)
		}
	} else if (['theme', 'theme-block'].includes(args.domain)) {
		const styleCssFile = path.join(sourceDir, 'style.css')

		if (fs.existsSync(styleCssFile)) {
			const fileContent = fs.readFileSync(styleCssFile, 'utf8')
			const commentBlock = getCommentBlock(fileContent)
			fileData = extractFileData(commentBlock)

			console.log('Theme stylesheet detected.')
			console.log(`Theme stylesheet: ${styleCssFile}`)
			args.domain = 'theme'
		} else {
			console.log(`Theme stylesheet not found in ${path.resolve(sourceDir)}`)
		}
	}

	return fileData
}
