import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { stringstring } from './makePot'
import path from 'path'
import { DEFAULT_EXCLUDED_PATH } from './const'
import { Args, DomainType } from './types'

/**
 * Retrieves and returns the command line arguments and options.
 *
 * @return {Args} The parsed command line arguments and options.
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
				describe: 'Subtract and merge strings from existing POT file(s)',
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
		})
		.parseSync()

	return {
		// Paths
		sourceDirectory: args.sourceDirectory ?? undefined,
		destination: args.destination ?? undefined,
		slug: args.slug ?? path.basename(process.cwd()),
		domain: (args.domain as DomainType) ?? 'generic',
		ignoreDomain: args.ignoreDomain ?? false,
		headers: undefined,
		location: args.location ?? false,
		// Patterns
		mergePaths: stringstring(args.mergePaths) ?? [],
		subtractPaths: stringstring(args.subtractPaths) ?? [],
		subtractAndMerge: args.subtractAndMerge ?? false,
		include: stringstring(args.include) ?? [],
		exclude: stringstring(args.exclude) ?? DEFAULT_EXCLUDED_PATH,
		// Config: skip, comment and package name
		skipJs: args.skipJs ?? false,
		skipPhp: args.skipPhp ?? false,
		skipBlade: args.skipBlade ?? false,
		skipBlockJson: args.skipBlockJson ?? false,
		skipThemeJson: args.skipThemeJson ?? false,
		skipAudit: args.skipAudit ?? false,
		fileComment: args.fileComment ?? '',
		packageName: args.packageName ?? '',
	} satisfies Args
}
