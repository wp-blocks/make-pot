import * as path from 'path'
import { type TranslationStrings } from '../types'
import { parseReadmeCallback } from './text'
import { readFileAsync } from '../fs'
import { parseJsonCallback } from './json'
import { doTree } from '../parser/tree'

/**
 * Parse a file and extract strings asynchronously
 *
 * @return {Promise<TranslationStrings>}
 */
export async function parseFile(
	file: string,
	filePath: string = ''
): Promise<TranslationStrings | undefined> {
	const filename = path.basename(file)
	const ext = path.extname(file).replace(/^./, '')
	const fileRealPath = path.resolve(filePath, file)

	if (ext === 'json') {
		if (filename === 'theme.json' || filename === 'block.json') {
			return readFileAsync(fileRealPath).then((sourceCode) => {
				return parseJsonCallback(sourceCode, filePath, filename)
			})
		}
	}

	if (filename === 'readme.txt') {
		return readFileAsync(fileRealPath).then((sourceCode) => {
			return parseReadmeCallback(sourceCode, filePath)
		})
	}

	if (['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'php'].includes(ext)) {
		// read the file
		return readFileAsync(fileRealPath).then((sourceCode) => {
			return doTree(sourceCode, file)
		})
	}
}
