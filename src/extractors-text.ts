import { removeCommentMarkup } from './utils'

/**
 * Extracts file data from the given file content.
 *
 * @param {string} fileContent - The content of the file.
 * @return {Record<string, string>} An object containing the extracted file data.
 */
export function extractFileData(fileContent: string): Record<string, string> {
	const data: Record<string, string> = {}

	// split by lines and trim every line
	fileContent
		.split('\n')
		.map((line) => line.trim())
		.map((line) => removeCommentMarkup(line))
		// split each line by colon trim each part and add to data
		.forEach((line) => {
			const parts = line.split(':')
			if (parts[1] === undefined) {
				return
			}
			data[parts[0]?.trim()] = parts[1]?.trim()
		})

	return data
}
