import { Args } from '../types'
import { cpus, totalmem } from 'node:os'
import { generateHeader, translationsHeaders } from '../extractors/headers'
import gettextParser, { GetTextTranslations } from 'gettext-parser'
import { getPatterns } from './patterns'
import { processFiles } from './process'
import { taskRunner } from './taskRunner'
import { getCopyright } from '../utils'

/**
 * Runs the parser and generates the pot file or the json file based on the command line arguments
 *
 * @param {Args} args - The command line arguments
 * @return {Promise<string>} - A promise that resolves with the generated pot file
 */
export async function exec(args: Args): Promise<string> {
	if (!args.options?.silent) {
		console.log('📝 Starting makePot for', args?.slug)
		console.log('🔍 Extracting strings from', args.paths)
	}

	if (!args.options?.silent) {
		console.log(
			'Memory usage:',
			(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			'MB (Free:',
			(totalmem() / 1024 / 1024 / 1024).toFixed(2),
			'GB)\nCpu User:',
			(process.cpuUsage().user / 1000000).toFixed(2),
			'ms Cpu System:',
			(process.cpuUsage().system / 1000000).toFixed(2),
			'ms of',
			cpus().length,
			'cores'
		)
	}

	// audit
	if (args.options?.skip.audit) {
		console.log('Audit strings...')
		/** TODO audit strings */
		console.log('✅ Done')
	}

	/** The pot file header contains the data about the plugin or theme */
	const potHeader = generateHeader(args)

	const copyrightComment =
		args.options?.fileComment ||
		getCopyright(
			args.slug,
			(args.headers?.license as string) ?? 'GPL v2 or later'
		)

	/** We need to find the main file data so that the definitions are extracted from the plugin or theme files */
	let translationsUnion = translationsHeaders(args)

	/**
	 * Extract the strings from the files
	 */
	const patterns = getPatterns(args)

	const tasks = await processFiles(patterns, args)

	translationsUnion = await taskRunner(tasks, translationsUnion, args)

	if (!args.options?.json) {
		return JSON.stringify([potHeader, translationsUnion.toJson()], null, 4)
	}

	// generate the pot file json
	const getTextTranslations: GetTextTranslations = {
		charset: 'iso-8859-1',
		headers: potHeader,
		translations: translationsUnion.toJson(),
	}

	// And then compile the pot file
	const pluginTranslations = gettextParser.po
		.compile(getTextTranslations)
		.toString('utf-8')

	// return the pot file as a string with the header
	return copyrightComment + '\n' + pluginTranslations
}
