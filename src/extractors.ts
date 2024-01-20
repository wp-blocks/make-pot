import * as path from 'path'
import * as fs from 'fs'
import { type Args, type TranslationStrings } from './types'
import { getCommentBlock } from './utils'
import Parser from 'tree-sitter'
import { jsonString, parseJsonFile } from './extractors-json'
import { parsePHPFile } from './extractors-php'
import { extractFileData } from './extractors-text'
import { pkgJsonHeaders } from './extractors-maps'
import { doTree } from './tree'

/**
 * Extracts strings from parsed JSON data.
 *
 * @param {Record<string, any> | Parser.SyntaxNode} parsed - The parsed JSON data or syntax node.
 * @param {string | Parser} filename - The filename or parser.
 * @param filepath - the path to the file being parsed
 * @return {TranslationStrings[]} An array of translation strings.
 */
export function yieldParsedData(
	parsed: Record<string, any>,
	filename: string | Parser,
	filepath: string
): TranslationStrings {
	const gettextTranslations: TranslationStrings = {}

	Object.entries(parsed).map(([k, v]) => {
		const entry = jsonString(
			k,
			v,
			filepath,
			filename as 'block.json' | 'theme.json'
		)

		gettextTranslations[entry.msgctxt ?? ''] = {
			...(gettextTranslations[entry.msgctxt ?? ''] || {}),
			[entry.msgid]: entry,
		}
	})

	return gettextTranslations
}

/**
 * Parse a file and extract strings asynchronously
 *
 * @return {Promise<TranslationStrings>}
 */
export async function parseFile(
	file: string
): Promise<TranslationStrings | null> {
	const ext = path.extname(file).replace(/^./, '')

	// check if the language is supported
	if (ext === 'json') {
		const filename = path.basename(file)

		if (filename === 'theme.json' || filename === 'block.json') {
			// read the file and parse it
			return parseJsonFile({
				sourceCode: fs.readFileSync(file, 'utf8'),
				filename: filename as 'block.json' | 'theme.json',
				filepath: file,
			})
		}
	}

	if (['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'php'].includes(ext)) {
		// read the file
		const sourceCode = fs.readFileSync(file, 'utf8')

		return doTree(sourceCode, file)
	}

	return new Promise((resolve) => resolve(null))
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
	const packageJsonPath = args.paths.cwd
		? path.join(args.paths.cwd, 'package.json')
		: 'package.json'
	// check if the package.json extract the fields
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
		const folderPhpFile = path.join(args.paths.cwd, `${args.slug}.php`)

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
		const styleCssFile = path.join(args.paths.cwd, 'style.css')

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
