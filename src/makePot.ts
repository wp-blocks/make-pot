import { type Args } from './types'
import { extractMainFileData, extractPackageData } from './extractors'
import { writePotFile } from './fs'
import { runExtract } from './parser'

/**
 * Splits a string into an array of strings based on the presence of a comma.
 *
 * @param {string} string - The string to be split.
 * @return {string[]} An array of strings after splitting the input string.
 */
export function stringstring(string: string | undefined): string[] {
	if (string) {
		if (string.includes(',')) {
			return string.split(',')
		}
		return [string]
	}
	return []
}

/**
 * Generates a pot file for localization.
 *
 * @param args - the command line arguments
 * @return {Promise<void>} - a promise that resolves when the pot file is generated
 */
export async function makePot(args: Args) {
	// get metadata from the main file (theme and plugin)
	const metadata = extractMainFileData(args)
	// get package data
	const pkgData = extractPackageData(args)

	const headers = { ...pkgData, ...metadata, ...args.headers }

	args = { ...args, headers } as Args
	console.log('📝 Making a pot file...')
	console.log('🔍 Extracting strings...', args.slug, args)

	const translations = await runExtract(args)

	await writePotFile(args, translations)
}
