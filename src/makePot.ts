import { type Args } from './types'
import { extractMainFileData, extractPackageData } from './extractors'
import { writePotFile } from './fs'
import { runExtract } from './parser'
import { cpus, totalmem } from 'node:os'

/**
 * Splits a string into an array of strings based on the presence of a comma.
 *
 * @param {string} string - The string to be split.
 * @return {string[]} An array of strings after splitting the input string.
 */
export function stringstring(
	string: string | string[] | undefined
): string[] | null {
	if (typeof string === 'string') {
		if (string.includes(',')) {
			return string.split(',')
		}
		return [string]
	}
	return null
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
	if (!args.silent) {
		console.log('📝 Making a pot file...')
		console.log('🔍 Extracting strings...', args.slug, args.headers)
	}

	const translations = await runExtract(args)

	// audit
	if (args.skipAudit) {
		console.log('🔍 Audit strings...')
		console.log(translations)
		console.log('✅ Done')
		process.exit(0)
	}

	if (!args.silent) {
		console.log(
			'Memory usage:',
			(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			'MB (Free:',
			(
				(totalmem() - process.memoryUsage().heapUsed) /
				1024 /
				1024 /
				1024
			).toFixed(2),
			'GB)\n',
			'Cpu User:',
			(process.cpuUsage().user / 1000000).toFixed(2),
			'ms Cpu System:',
			(process.cpuUsage().system / 1000000).toFixed(2),
			'ms of',
			cpus().length,
			'cores'
		)
	}
	await writePotFile(args, translations)
}
