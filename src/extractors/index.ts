import * as path from 'path'
import * as fs from 'fs'
import { type TranslationStrings } from '../types'
import { getCommentBlock } from '../utils'
import Parser from 'tree-sitter'
import { getJsonComment, jsonString, parseJsonFile } from './json'
import { extractFileData } from './text'
import { doTree } from '../tree'

/**
 * Extracts strings from parsed JSON data.
 *
 * @param {Record<string, any> | Parser.SyntaxNode} parsed - The parsed JSON data or syntax node.
 * @param {string | Parser} filename - The filename or parser.
 * @param filepath - the path to the file being parsed
 * @return {TranslationStrings[]} An array of translation strings.
 */
export function yieldParsedData(
	parsed: Record<string, string>,
	filename: string | Parser,
	filepath: string
): TranslationStrings {
	const gettextTranslations: TranslationStrings = {}

	Object.entries(parsed).map(([k, v]) => {
		const entry = jsonString(
			getJsonComment(k, filename as 'block.json' | 'theme.json'),
			v,
			filepath
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
	file: string,
	filePath: string = ''
): Promise<TranslationStrings | null> {
	const ext = path.extname(file).replace(/^./, '')
	const fileRealPath = path.resolve(filePath, file)

	// check if the language is supported
	if (ext === 'json') {
		const filename = path.basename(file)

		if (filename === 'theme.json' || filename === 'block.json') {
			// read the file and parse it
			return parseJsonFile({
				sourceCode: fs.readFileSync(fileRealPath, 'utf8'),
				filename: filename as 'block.json' | 'theme.json',
				filepath: filePath,
			})
		}
	}

	if (ext === 'txt') {
		// the filename
		const filename = path.basename(file)

		if (filename === 'readme.txt') {
			// read the readme file and parse it
			const fileContent = fs.readFileSync(file, 'utf8')
			const commentBlock = getCommentBlock(fileContent)
			const parsed = extractFileData(commentBlock)

			// todo: yeldParsedData should be moved to extractors
			if (parsed) {
				// extract the strings from the file and return them as an array of objects
				return yieldParsedData(parsed, filename, filePath)
			} else {
				return {}
			}
		}
	}

	if (['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'php'].includes(ext)) {
		// read the file
		const sourceCode = fs.readFileSync(fileRealPath, 'utf8')

		return doTree(sourceCode, file)
	}

	return new Promise((resolve) => resolve(null))
}
