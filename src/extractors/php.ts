import { pluginHeaders } from '../const'
import { getKeyByValue } from './utils'
import type { Args } from '../types'
import path from 'path'
import fs from 'fs'

export function extractPhpPluginData(args: Args): Record<string, string> {
	let fileData: Record<string, string> = {}
	const folderPhpFile = path.join(args.paths.cwd, `${args.slug}.php`)

	if (fs.existsSync(folderPhpFile)) {
		const fileContent = fs.readFileSync(folderPhpFile, 'utf8')
		fileData = parsePHPFile(fileContent)

		// Set the domain
		console.log('Plugin file detected.')
		console.log(`Plugin file: ${folderPhpFile}`)
		args.domain = 'plugin'

		return fileData
	} else {
		console.log('Plugin file not found.')
		console.log(`Missing Plugin filename: ${folderPhpFile}`)
	}

	return {}
}

/**
 * Parses a PHP file and extracts the plugin information from the comment block.
 *
 * @param {string} phpContent - The content of the PHP file.
 * @return {Record<string, string>} - A record containing the plugin information.
 */
export function parsePHPFile(phpContent: string): Record<string, string> {
	const match = phpContent.match(/\/\*\*([\s\S]*?)\*\//)

	if (match && match[1]) {
		const commentBlock = match[1]
		const lines = commentBlock.split('\n')

		const pluginInfo: Record<string, string> = {}

		for (const line of lines) {
			const keyValueMatch = line.match(/^\s*\*\s*([^:]+):\s*(.*)/)

			// Check if the line matches the expected format
			if (keyValueMatch && keyValueMatch[1] && keyValueMatch[2]) {
				// filter the retrieved headers
				const header = getKeyByValue(
					pluginHeaders,
					keyValueMatch[1].trim()
				)
				if (header === undefined) continue
				pluginInfo[header] = keyValueMatch[2].trim()
			}
		}

		return pluginInfo
	}
	return {}
}
