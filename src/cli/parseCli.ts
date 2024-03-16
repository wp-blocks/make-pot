import yargs from 'yargs'
import { stringstring } from '../utils'
import * as path from 'path'
import * as process from 'process'
import { DEFAULT_EXCLUDED_PATH } from '../const'
import { Args, DomainType } from '../types'
import fs, { accessSync } from 'node:fs'
import { getCopyright } from '../parser/exec'

function isThemeOrPlugin(currentPath: string = '/', slug: string) {
	const currentWorkingDirectory = currentPath

	try {
		accessSync(
			path.join(currentWorkingDirectory, slug + '.php'),
			fs.constants.R_OK
		)
		return 'plugin'
	} catch (err) {
		// do nothing
		console.log(
			'the current working directory ' +
				currentWorkingDirectory +
				' does not contain a ' +
				slug +
				'.php file'
		)
	}

	try {
		accessSync(
			path.join(currentWorkingDirectory, 'style.css'),
			fs.constants.R_OK
		)
		return 'theme'
	} catch (err) {
		// do nothing
		console.log(
			'the current working directory ' +
				currentWorkingDirectory +
				' does not contain a style.css file'
		)
	}

	if (currentWorkingDirectory.includes('themes')) {
		return 'theme'
	} else if (currentWorkingDirectory.includes('plugins')) {
		return 'plugin'
	}
	return 'generic'
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
	// Get the input and output paths
	const inputPath: string = typeof args._[0] === 'string' ? args._[0] : '.'
	const outputPath: string = typeof args._[1] === 'string' ? args._[1] : '.'
	const currentWorkingDirectory = process.cwd()
	const slug =
		args.slug && typeof args.slug === 'string'
			? args.slug
			: path.basename(path.resolve(currentWorkingDirectory, inputPath))
	const cwd = path.relative(currentWorkingDirectory, inputPath)
	const out = path.relative(currentWorkingDirectory, outputPath)

	/** get the domain to look for (plugin, theme, etc) */
	const domain =
		(args?.domain as DomainType) ?? isThemeOrPlugin(path.resolve(cwd), slug)

	const parsedArgs: Args = {
		slug: slug,
		domain: domain,
		paths: { cwd: cwd, out: out },
		options: {
			ignoreDomain: !!args?.ignoreDomain,
			packageName: String(args.packageName),
			silent: !!args.silent,
			json: !!args.json,
			location: !!args?.location,
			output: !!args?.output,
			fileComment: args.fileComment
				? String(args.fileComment)
				: undefined,
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
