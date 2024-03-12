import type { Args } from '../types'
import path from 'path'
import fs from 'fs'
import { getCommentBlock } from '../utils'
import { extractFileData } from './text'

/**
 * Extracts the theme data from the style.css file.
 * @param args
 */
export function extractCssThemeData(args: Args) {
	let fileData: Record<string, string> = {}
	const styleCssFile = path.join(args.paths.cwd, 'style.css')

	if (fs.existsSync(styleCssFile)) {
		const fileContent = fs.readFileSync(styleCssFile, 'utf8')
		const commentBlock = getCommentBlock(fileContent)
		fileData = extractFileData(commentBlock)

		if ('Name' in fileData) {
			console.log('Theme stylesheet detected.')
			console.log(`Theme stylesheet: ${styleCssFile}`)
			args.domain = 'theme'

			return fileData
		}
	} else {
		console.log(`Theme stylesheet not found in ${styleCssFile}`)
	}
	return {}
}
