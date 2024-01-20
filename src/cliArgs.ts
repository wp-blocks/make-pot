import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { stringstring } from './utils'
import * as path from 'path'
import * as process from 'process'
import { DEFAULT_EXCLUDED_PATH } from './const'
import { Args, DomainType } from './types'
import { type } from 'node:os'

/**
 * Retrieves and returns the command line arguments and options.
 *
 * @return The parsed command line arguments and options.
 */
export function getArgs() {
	const args = yargs(hideBin(process.argv))
		.help('h')
		.alias('help', 'help')
		.usage('Usage: $0 <source> [destination] [options]')
		.positional('sourceDirectory', {
			describe: 'Source directory',
			type: 'string',
		})
		.positional('destination', {
			describe: 'Destination directory',
			type: 'string',
		})
		.options({
			slug: {
				describe: 'Plugin or theme slug',
				type: 'string',
			},
			domain: {
				describe: 'Text domain to look for in the source code',
				type: 'string',
			},
			'skip-js': {
				describe: 'Skip JavaScript files',
				type: 'boolean',
			},
			'skip-php': {
				describe: 'Skip PHP files',
				type: 'boolean',
			},
			'skip-blade': {
				describe: 'Skip Blade files',
				type: 'boolean',
			},
			'skip-block-json': {
				describe: 'Skip block.json files',
				type: 'boolean',
			},
			'skip-theme-json': {
				describe: 'Skip theme.json files',
				type: 'boolean',
			},
			'skip-audit': {
				describe: 'Skip auditing of strings',
				type: 'boolean',
			},
			headers: {
				describe: 'Headers',
				type: 'string',
			},
			'file-comment': {
				describe: 'File comment',
				type: 'string',
			},
			'package-name': {
				describe: 'Package name',
				type: 'string',
			},
			location: {
				describe: 'Include location information',
				type: 'boolean',
			},
			'ignore-domain': {
				describe: 'Ignore text domain',
				type: 'boolean',
			},
			mergePaths: {
				describe: 'Merge with existing POT file(s)',
				type: 'string',
			},
			subtractPaths: {
				describe: 'Subtract strings from existing POT file(s)',
				type: 'string',
			},
			subtractAndMerge: {
				describe:
					'Subtract and merge strings from existing POT file(s)',
				type: 'boolean',
			},
			include: {
				describe: 'Include specific files',
				type: 'string',
			},
			exclude: {
				describe: 'Exclude specific files',
				type: 'string',
			},
			silent: {
				describe: 'No output to stdout',
				type: 'boolean',
			},
			json: {
				describe: 'output the json gettext data',
				type: 'boolean',
			},
		})
		.parseSync()
	return parseCliArgs(args)
}

/**
 * Parses the command line arguments and returns an object with the parsed values.
 *
 * @param {{_: string[]}} args - The command line arguments to be parsed.
 * @return {object} - An object with the parsed values from the command line arguments.
 */
export function parseCliArgs(
	args: yargs.PositionalOptions & yargs.Options & yargs.Arguments
): Args {
	const [inputPath, outputPath] = args._ as [string, string]
	const parsedArgs: Args = {
		slug:
			args.slug && typeof args.slug === 'string'
				? args.slug
				: path.basename(process.cwd()),
		domain: (args?.domain as DomainType) ?? 'generic',
		paths: {
			cwd: inputPath ? path.relative(process.cwd(), inputPath) : '.',
			out: outputPath ? path.relative(process.cwd(), outputPath) : '.',
		},
		options: {
			ignoreDomain: !!args?.ignoreDomain,
			packageName: String(args.packageName ?? ''),
			silent: !!args.silent,
			json: !!args.json,
			location: !!args?.location,

			// Config: skip, comment and package name
			skip: {
				js: !!args.skipJs,
				php: !!args.skipPhp,
				blade: !!args.skipBlade,
				blockJson: !!args.skipBlockJson,
				themeJson: !!args.skipThemeJson,
				audit: !!args.skipAudit,
			},
		},
		// Headers
		headers: {
			fileComment: (args.fileComment as string) ?? '',
		},
		// Patterns
		patterns: {
			mergePaths: stringstring(args.mergePaths as string) ?? [],
			subtractPaths: stringstring(args.subtractPaths as string) ?? [],
			subtractAndMerge: !!args.subtractAndMerge,
			include: stringstring(args.include as string) ?? ['**'],
			exclude:
				stringstring(args.exclude as string) ?? DEFAULT_EXCLUDED_PATH,
		},
	}
	parsedArgs.paths.root = args.root ? String(args.root) : undefined

	return parsedArgs
}
