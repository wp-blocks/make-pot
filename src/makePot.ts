import { type Args } from './types'
import { extractMainFileData, extractPackageJson } from './extractors'
import { writeFile } from './fs'
import { runExtract } from './parser'
import { cpus, totalmem } from 'node:os'
import gettextParser, { GetTextTranslations } from 'gettext-parser'
import { generateHeaderComments } from './utils'
import path from 'path'

/**
 * Runs the parser and generates the pot file or the json file based on the command line arguments
 *
 * @param {Args} args - The command line arguments
 * @return {Promise<string>} - A promise that resolves with the generated pot file
 */
async function exec(args: Args): Promise<string> {
	if (!args.options?.silent) {
		console.log('📝 Making a pot file...')
		console.log('🔍 Extracting strings...', args?.slug, args)
	}

	const stringsJson = await runExtract(args)

	if (!args.options?.silent) {
		console.log(
			'Memory usage:',
			(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			'MB (Total:',
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
		// TODO: --
		console.log('✅ Done')
	}

	// otherwise return gettext po string
	const getTextTranslations: GetTextTranslations = {
		charset: 'iso-8859-1',
		headers: {
			'': args.headers?.fileComment ?? generateHeaderComments(args),
		},
		translations: stringsJson,
	}

	// push the rest of the headers to the header object
	if (args.headers && Object.values(args.headers).length)
		Object.entries(args.headers).map(
			(header) =>
				(getTextTranslations.headers[header[0]] =
					typeof header[1] === 'string'
						? header[1]
						: JSON.stringify(header[1]))
		)

	// if --json is true output and die
	if (args.options?.json) {
		return JSON.stringify(getTextTranslations)
	}

	// otherwise return the pot file
	return gettextParser.po
		.compile(getTextTranslations, {
			sort: true,
		})
		.toString('utf-8')
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
	const pkgData = extractPackageJson(args)

	const headers = { ...pkgData, ...metadata, ...args.headers }

	args = { ...args, headers } as Args

	const jsonTranslations = await exec(args)

	return await writeFile(
		jsonTranslations,
		path.join(
			process.cwd(),
			args.paths.out,
			`${args?.slug}.${args.options?.json ? 'json' : 'pot'}`
		)
	)
}
