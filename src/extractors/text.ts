import { removeCommentMarkup } from '../utils'

/**
 * Extracts file data from the given file content.
 *
 * @param {string} fileContent - The content of the file.
 * @param {string} separator - The separator used in the file.
 * @return {Record<string, string>} An object containing the extracted file data.
 */
export function extractFileData(
	fileContent: string,
	separator = ':'
): Record<string, string> {
	const data: Record<string, string> = {}

	// split by lines and trim every line
	fileContent
		.trimStart()
		.split('\n')
		.map((line) => line.trim())
		.map((line) => removeCommentMarkup(line))
		// split each line by break line and trim each part and add to data
		.forEach((line) => {
			const parts = line.split(separator)
			/* Check if the parser has already collected the data from the previous line
			 and the current line is empty.
			 If so, skip this line */
			if (parts.length !== 2 && Object.values(data).length > 0) {
				return
			}
			data[parts[0]?.trim()] = parts[1]?.trim()
		})

	return data
}
