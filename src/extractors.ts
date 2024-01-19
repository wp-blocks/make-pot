import path from 'path'
import fs, { readFileSync } from 'fs'
import { type Args, type TranslationStrings } from './types'
import { getCommentBlock } from './utils'
import Parser from 'tree-sitter'
import type { SingleBar } from 'cli-progress'
import { jsonString, parseJsonFile } from './extractors-json'
import { parsePHPFile } from './extractors-php'
import { extractStrings } from './tree'
import { extractFileData } from './extractors-text'
import { pkgJsonHeaders } from './extractors-maps'

/**
 * Extracts the names from an array of items.
 *
 * @param {unknown[]} items - The array of items.
 * @return {string[]} An array of names extracted from the items.
 */
export const extractNames = (items: { name: string }[]): string[] =>
	items.map((item) => item.name)

/**
 * Extracts strings from parsed JSON data.
 *
 * @param {Record<string, any> | Parser.SyntaxNode} parsed - The parsed JSON data or syntax node.
 * @param {string | Parser} filename - The filename or parser.
 * @param opts - The metadata of this translation string.
 * @return {TranslationStrings[]} An array of translation strings.
 */
export function yieldParsedData(
	parsed: Record<string, any>,
	filename: string | Parser,
	opts: { filepath: string; stats?: { bar: SingleBar } }
): Promise<TranslationStrings> {
	return new Promise<TranslationStrings>((resolve) => {
		const gettextTranslations: TranslationStrings = {}

		Object.entries(parsed).map(([k, v]) => {
			const entry = jsonString(
				k,
				v,
				opts.filepath,
				filename as 'block.json' | 'theme.json'
			)

			gettextTranslations[entry.msgctxt ?? ''] = {
				...(gettextTranslations[entry.msgctxt ?? ''] || {}),
				[entry.msgid]: entry,
			}
		})
		resolve(gettextTranslations)
	})
}

/**
 * Parses the source code using the specified language parser and extracts the strings from the file.
 *
 * @param {string} sourceCode - The source code to be parsed.
 * @param {Args} language - The language to be used for parsing.
 * @param {string} filepath - The path to the file being parsed.
 * @return {TranslationStrings[]} An array of translation strings.
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
 * @param {object} opts
 * @param {string} opts.filepath - Path to the file to parse
 * @param {Parser|null} opts.language - Language of the file to parse
 * @return {Promise<TranslationStrings>}
 */
export async function parseFile(opts: {
	filepath: string
	language: Parser | string
}): Promise<TranslationStrings | null> {
	// check if the language is supported
	if (typeof opts.language === 'string') {
		if (opts.language === 'json') {
			return parseJsonFile(opts)
		}
		console.log(
			`Skipping ${opts.filepath}... No parser found for ${opts.language} file`
		)
		return null
	}

	// read the file
	const sourceCode = readFileSync(opts.filepath, 'utf8')

	// set up the parser
	const parser = new Parser()
	parser.setLanguage(opts.language)

	// parse the file
	const tree = parser.parse(sourceCode) // Assuming parse is an async operation

	// extract the strings from the file and return them
	return extractStrings(tree.rootNode, opts.language, opts.filepath)
}

/**
 * Extracts package data from the given arguments and returns a record
 * containing the specified fields from the package.json file.
 *
 * @param {Args} args - The arguments for extracting package data.
 * @param {Record<string, string>} fields - The fields to extract from the package.json file. Default is pkgJsonHeaders.
 * @return {Record<string, string>} - A record containing the extracted package data.
 */
export function extractPackageData(
	args: Args,
	fields = pkgJsonHeaders
): Record<string, string> {
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

	if (['plugin', 'block', 'generic'].includes(args.domain)) {
		const folderPhpFile = path.join(
			process.cwd(),
			args.sourceDirectory,
			`${args.slug}.php`
		)

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
		const styleCssFile = path.join(
			process.cwd(),
			args.sourceDirectory,
			'style.css'
		)

		if (fs.existsSync(styleCssFile)) {
			const fileContent = fs.readFileSync(styleCssFile, 'utf8')
			const commentBlock = getCommentBlock(fileContent)
			fileData = extractFileData(commentBlock)

			console.log('Theme stylesheet detected.')
			console.log(`Theme stylesheet: ${styleCssFile}`)
			args.domain = 'theme'
		} else {
			console.log(`Theme stylesheet not found in ${styleCssFile}`)
		}
	}

	return fileData
}
