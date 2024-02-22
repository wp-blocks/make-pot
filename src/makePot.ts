import { type Args, DomainType, TranslationStrings } from './types'
import { extractMainFileData, extractPackageJson } from './extractors'
import { writeFile } from './fs'
import { runExtract } from './parser'
import { cpus, totalmem } from 'node:os'
import gettextParser, {
	GetTextTranslation,
	GetTextTranslations,
} from 'gettext-parser'
import { generateHeaderComments } from './utils'
import path from 'path'

const gentranslation = (
	label: string,
	string: string = ''
): GetTextTranslation => {
	return {
		msgid: string,
		msgstr: [''],
		comments: {
			extracted: label,
		} as GetTextTranslation['comments'],
	}
}

export function translationsHeaders(
	type: DomainType,
	headers: Args['headers']
): TranslationStrings {
	/** the block case */
	if (type === 'block') {
		const { name, description, keyword } = headers as {
			name: string
			description: string
			keyword: string
		}
		return {
			'': {
				name: gentranslation('block title', name),
				description: gentranslation('block description', description),
				keyword: gentranslation('block keyword', keyword),
			},
		}
	}

	const { name, description, author } = headers as {
		name: string
		description: string
		author: string
	}
	/** the theme and plugin case, the rest is not supported yet */
	return {
		'': {
			name: gentranslation('Name of the ' + type, name),
			description: gentranslation(
				'Description of the ' + type,
				description
			),
			author: gentranslation('Author of the ' + type, author),
		},
	}
}

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
		console.log('✅ Done')
	}

	const headersTranslations = translationsHeaders(args.domain, args.headers)

	// otherwise return gettext po string
	const getTextTranslations: GetTextTranslations = {
		charset: 'iso-8859-1',
		headers: {
			'': args.headers?.fileComment ?? generateHeaderComments(args),
		},
		translations: { ...headersTranslations, ...stringsJson },
	}

	// otherwise return the pot file
	const pluginTranslations = gettextParser.po
		.compile(getTextTranslations, {
			sort: false,
		})
		.toString('utf-8')

	return pluginTranslations
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
