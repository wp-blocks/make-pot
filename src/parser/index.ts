import type { Args } from '../types'
import { getFiles } from '../fs/glob'
import { getPatterns } from './patterns'
import { getStrings } from './process'

/**
 * Runs the extract process based on the given arguments.
 *
 * @param {Args} args - The arguments for the extract process.
 * @return {Promise<void>} - A promise that resolves with the extracted data.
 */
export async function runExtract(args: Args) {
	const pattern = getPatterns(args)
	const files = await getFiles(args, pattern)
	return getStrings(args, files)
}
