import type { Args } from './types'
import path from 'path'
import fs from 'fs'
import { parsePHPFile } from './extractors-php'
import { getCommentBlock } from './utils'
import { extractFileData } from './extractors-text'

export function extractPhpPluginData(args: Args): Record<string, string> {
	let fileData: Record<string, string> = {}
	const folderPhpFile = path.join(args.paths.cwd, `${args.slug}.php`)

	if (fs.existsSync(folderPhpFile)) {
		const fileContent = fs.readFileSync(folderPhpFile, 'utf8')
		fileData = parsePHPFile(fileContent)

		if ('name' in fileData) {
			console.log('Plugin file detected.')
			console.log(`Plugin file: ${folderPhpFile}`)
			args.domain = 'plugin'

			return fileData
		}
	} else {
		console.log('Plugin file not found.')
		console.log(`Missing Plugin filename: ${folderPhpFile}`)
	}

	return {}
}

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

/**
 * Extracts main file data based on the given arguments.
 *
 * @param {Args} args - The arguments for extracting the main file data.
 * @return {Record<string, string>} The extracted main file data.
 */
export function extractMainFileData(args: Args): Record<string, string> {
	if (['plugin', 'block', 'generic'].includes(args.domain)) {
		return extractPhpPluginData(args)
	} else if (['theme', 'theme-block'].includes(args.domain)) {
		return extractCssThemeData(args)
	}

	console.log('No main file detected.')
	return {}
}
