import { pluginHeaders } from './extractors-maps'

/**
 * Returns the key of an object based on its value
 *
 * @param object the object that contains the key
 * @param value the key that we want to get
 */
function getKeyByValue(
	object: {
		[x: string]: unknown
	},
	value: string
) {
	return Object.keys(object).find((key) => object[key] === value) ?? value
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
				let header = keyValueMatch[1].trim()
				// filter the retrieved headers
				header =
					pluginHeaders[header as keyof typeof pluginHeaders] ??
					header
				header = getKeyByValue(pluginHeaders, header)
				pluginInfo[header] = keyValueMatch[2].trim()
			}
		}

		return pluginInfo
	}
	return {}
}
