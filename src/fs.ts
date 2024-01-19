import { type Args } from './types'
import path from 'path'
import fs from 'fs'

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
 * @param args
 * @param fileContent
 */
export async function writePotFile(args: Args, fileContent: string) {
	// the path to the .pot file
	const potFilePath = args.destination
		? path.join(process.cwd(), args.destination)
		: path.join(process.cwd())

	if (ensureFolderExists(potFilePath)) {
		fs.writeFileSync(
			path.join(potFilePath, `${args.slug}.pot`),
			fileContent
		)
	}
}
