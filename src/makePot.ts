import { type Args, TranslationStrings } from './types'
import {
	extractMainFileData,
	generateHeader,
	translationsHeaders,
} from './extractors/headers'
import { writeFile } from './fs'
import { runExtract } from './parser'
import { cpus, totalmem } from 'node:os'
import gettextParser, {
	GetTextTranslation,
	GetTextTranslations,
} from 'gettext-parser'
import path from 'path'
import { extractPackageJson } from './extractors/utils'
import { advancedObjectMerge } from './utils'
/**
 * Runs the parser and generates the pot file or the json file based on the command line arguments
 *
 * @param {Args} args - The command line arguments
 * @return {Promise<string>} - A promise that resolves with the generated pot file
 */
async function exec(args: Args): Promise<string> {
	if (!args.options?.silent) {
		console.log('📝 Starting makePot for ', args?.slug)
		console.log('🔍 Extracting strings from', args.paths)
		console.log('💢 With args', args.options)
	}

	/** extract the strings from the files */
	const stringsJson = await runExtract(args)

	if (!args.options?.silent) {
		console.log('✅ Done!')

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
		`# Copyright (C) ${new Date().getFullYear()} ${args.slug}\n` +
		`# This file is distributed under the ${args.headers?.license ?? 'GPL v2 or later'} license.`

	/** We need to find the main file data so that the definitions are extracted from the plugin or theme files */
	const potDefinitions = translationsHeaders(args)

	const translationsUnion: {
		[msgctxt: string]: { [msgId: string]: GetTextTranslation }
	} = advancedObjectMerge(
		{ '': potDefinitions } as TranslationStrings,
		stringsJson
	)

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

/**
 * Generates a pot file for localization.
 *
 * @param args - the command line arguments
 * @return {Promise<void>} - a promise that resolves when the pot file is generated
 */
export async function makePot(args: Args) {
	/** collect metadata from the get package json */
	const pkgData = extractPackageJson(args)

	/** get metadata from the main file (theme and plugin) */
	const metadata = extractMainFileData(args)

	/** Merge the metadata to get a single object with all the headers */
	args.headers = {
		...args.headers,
		...pkgData,
		...{
			name: metadata.name,
			description: metadata.description,
			author: metadata.author,
		},
	} as Args['headers']

	/** generate the pot file */
	const jsonTranslations = await exec(args)

	writeFile(
		jsonTranslations,
		path.join(
			process.cwd(),
			args.paths.out,
			`${args?.slug}.${args.options?.json ? 'json' : 'pot'}`
		)
	)

	return jsonTranslations
}
