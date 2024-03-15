import type { Args, TranslationStrings } from '../types'
import { getFiles } from '../fs/glob'
import { getPatterns } from './patterns'
import { getStrings } from './process'

/**
 * Runs the extract process based on the given arguments.
 *
 * @param {Args} args - The arguments for the extract process.
 * @return {Promise<string>} - A promise that resolves with the extracted data.
 */
export async function runExtract(args: Args): Promise<TranslationStrings[]> {
	const pattern = getPatterns(args)
	const files = await getFiles(args, pattern)
	console.log(
		'Found ',
		Object.values(files).length,
		'files that match the pattern'
	)
	return await getStrings(args, files)
}
