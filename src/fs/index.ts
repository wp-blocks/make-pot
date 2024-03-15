import * as path from 'path'
import fs from 'node:fs'

/**
 * Ensures that a folder exists at the specified path.
 *
 * @param {string | undefined} folderPath - The path of the folder to ensure existence for.
 * @return {string} - The path of the folder, or '.' if folderPath is undefined.
 */
function ensureFolderExists(folderPath: string | undefined): string {
	if (folderPath === undefined) {
		return '.'
	}
	try {
		// Check if the folder exists
		fs.accessSync(
			path.resolve(folderPath),
			fs.constants.R_OK | fs.constants.W_OK
		)
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			// The Folder does not exist, so create it
			fs.mkdirSync(folderPath, { recursive: true })
			console.log(`Folder created: ${folderPath}`)
			return folderPath
		}
	}
	return folderPath
}

/**
 * Writes the .pot file to disk
 *
 * @param fileContent the content of the .pot file
 * @param dest the path of the .pot file to write
 */
export function writeFile(fileContent: string, dest: string) {
	if (ensureFolderExists(path.dirname(dest))) {
		fs.writeFileSync(dest, fileContent)
	}
}

export async function readFileAsync(path: string): Promise<string> {
	return fs.promises.readFile(path, 'utf-8')
}
