import { Args, type TranslationStrings } from '../types'
import { runExtract } from './index'
import { cpus, totalmem } from 'node:os'
import { generateHeader, translationsHeaders } from '../extractors/headers'
import gettextParser, {
	GetTextTranslation,
	GetTextTranslations,
} from 'gettext-parser'
import { advancedObjectMerge } from '../utils'
import { consolidate } from './consolidate'

/**
 * Generates a copyright comment for the specified slug and license.
 *
 * @param {string} slug - The slug to include in the copyright comment
 * @param {string} [license='GPL v2 or later'] - The license to use in the copyright comment
 * @return {string} The generated copyright comment
 */
export function getCopyright(
	slug: string,
	license: string = 'GPL v2 or later'
): string {
	const copyrightComment =
		`# Copyright (C) ${new Date().getFullYear()} ${slug}\n` +
		`# This file is distributed under the ${license} license.`
	return copyrightComment
}

/**
 * Runs the parser and generates the pot file or the json file based on the command line arguments
 *
 * @param {Args} args - The command line arguments
 * @return {Promise<string>} - A promise that resolves with the generated pot file
 */
export async function exec(args: Args): Promise<string> {
	if (!args.options?.silent) {
		console.log('📝 Starting makePot for ', args?.slug)
		console.log('🔍 Extracting strings from', args.paths)
		console.log('💢 With options', args.options)
	}

	/**
	 * Extract the strings from the files
	 */
	let stringsJson = await runExtract(args)
	console.log('🎉 Done!')
	stringsJson = stringsJson.filter(
		(value) => value && Object.values(value).length
	)

	if (!args.options?.silent) {
		console.log(
			'Memory usage:',
			(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			'MB (Free:',
			(totalmem() / 1024 / 1024 / 1024).toFixed(2),
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
	const potDefinitions: TranslationStrings = { '': translationsHeaders(args) }

	/**
	 * Consolidate the strings to a single object so that the final pot file can be generated
	 */
	const translationsUnion: GetTextTranslations['translations'] = consolidate([
		potDefinitions,
		...stringsJson,
	])

	if (!args.options?.silent) {
		console.log(
			'📝 Found',
			Object.values(translationsUnion).length,
			'group of strings in',
			stringsJson.length,
			'files.\n',
			'In total ' +
				Object.values(translationsUnion)
					.map((v) => Object.keys(v).length)
					.reduce((acc, val) => acc + val, 0) +
				' strings were found'
		)
	}

	// generate the pot file json
	const getTextTranslations: GetTextTranslations = {
		charset: 'iso-8859-1',
		headers: potHeader,
		translations: translationsUnion,
	}

	// And then compile the pot file
	const pluginTranslations = gettextParser.po
		.compile(getTextTranslations)
		.toString('utf-8')

	// return the pot file as a string with the header
	return copyrightComment + '\n' + pluginTranslations
}
