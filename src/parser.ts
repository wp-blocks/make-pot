import type { Args, Patterns, TranslationString } from './types'
import { glob } from 'glob'
import { consolidateTranslations } from './consolidate'
import cliProgress, { type SingleBar } from 'cli-progress'
import { parseFile } from './extractors'
import { cpus } from 'node:os'
import Parser from 'tree-sitter'

// @ts-expect-error
import Js from 'tree-sitter-javascript'
// @ts-expect-error
import Php from 'tree-sitter-php'
// @ts-expect-error
import Ts from 'tree-sitter-typescript'

/**
 * Return the parser based on the file extension
 *
 * @param file - Path to the file
 * @return {Parser|{}|null} - the parser to be used with the file or null if no parser is found
 */
export function getParser(file: string): string | Parser {
	const ext = file.split('.').pop()
	switch (ext) {
		case 'ts':
			return Ts.typescript
		case 'tsx':
			return Ts.tsx
		case 'js':
		case 'jsx':
		case 'mjs':
		case 'cjs':
			return Js
		case 'php':
			return Php
		default:
			return ext!
	}
}

/**
 * Retrieves a list of files based on the provided arguments and patterns.
 *
 * @param {Args} args - The argument object containing the source directory and other options.
 * @param {Patterns} pattern - The pattern object containing the included and excluded file patterns.
 * @return {Promise<string[]>} A promise that resolves to an array of file paths.
 */
export function getFiles(args: Args, pattern: Patterns) {
	const includedPatterns = pattern.include
		? pattern.include.map((p) => p.trim()).filter((p) => p)
		: ['**']

	// Process excludePaths
	const excludedPatterns = (pattern.exclude ?? []).concat(
		args.exclude?.map((p) => p.trim()).filter((p) => p) ?? []
	)

	// Execute the glob search with the built patterns
	return glob(includedPatterns, {
		ignore: excludedPatterns ? excludedPatterns : undefined,
		nodir: true,
		cwd: args.sourceDirectory ?? process.cwd(),
	})
}

/**
 * Initializes a progress bar and returns the progress bar element.
 *
 * @param {Args} args - The argument object containing the source directory and other options.
 * @param {number} filesCount - An array of file names.
 * @return {cliProgress.SingleBar} The progress bar element.
 */
function initProgress(args: Args, filesCount: number): SingleBar | null {
	if (args.silent) return null
	// Set up the progress bar
	const progressBar = new cliProgress.SingleBar(
		{
			clearOnComplete: true,
			etaBuffer: 1000,
			hideCursor: true,
			format: ' {bar} {percentage}% | ETA: {eta}s | {filename} | {value}/{total}',
		},
		cliProgress.Presets.shades_classic
	)

	progressBar.start(filesCount, 0)

	// Return the progress bar element
	return progressBar
}

/**
 * Retrieves an array of translation strings from files that match the specified arguments and pattern.
 *
 * @param {Args} args - The arguments to specify which files to search and parse.
 * @param {Patterns} pattern - The pattern to match files against.
 * @return {Promise<TranslationString[]>} A promise that resolves to an array of translation strings found in the files.
 */
export async function getStrings(args: Args, pattern: Patterns) {
	const files = await getFiles(args, pattern)

	const tasks: Array<Promise<TranslationString[]>> = []

	const progressBar = initProgress(args, files.length)

	for (const file of files) {
		const task = parseFile({
			filepath: file,
			language: getParser(file),
		})

		// log the filepath
		if (progressBar) {
			progressBar.increment(1, {
				filename: file,
			})
		}

		if (task !== null) tasks.push(task as Promise<TranslationString[]>)
	}

	const results = await Promise.all(tasks)

	if (progressBar) {
		progressBar.stop()
	}

	const result = results.flat().filter((t) => t != null) as TranslationString[]

	console.log('📝 Found', result.length, 'strings in', files.length, 'files.')
	console.log(
		'Memory usage:',
		process.memoryUsage().heapUsed / 1024 / 1024,
		'MB - Heap usage:',
		process.memoryUsage().heapUsed / 1024 / 1024,
		'MB'
	)
	console.log(
		'Cpu User:',
		process.cpuUsage().user / 1000000,
		'ms Cpu System:',
		process.cpuUsage().system / 1000000,
		'ms of',
		cpus().length,
		'cores'
	)

	return result
}

/**
 * Runs the extract process based on the given arguments.
 *
 * @param {Args} args - The arguments for the extract process.
 * @return {Promise<string>} - A promise that resolves with the extracted data.
 */
export async function runExtract(args: Args) {
	const pattern = {
		include: args.include ?? [],
		exclude: args.exclude ?? [],
		mergePaths: args.mergePaths ?? [],
		subtractPaths: args.subtractPaths ?? [],
		subtractAndMerge: args.subtractAndMerge ?? false,
	}

	// Additional logic to handle different file types and formats
	// Exclude blade.php files if --skip-blade is set
	if (args.skipPhp !== true || args.skipBlade !== true) {
		if (args.skipBlade !== true) {
			// php files but not blade.php
			pattern.include.push('**/*.php')
		} else {
			pattern.include.push('**/*.php', '!**/blade.php')
		}
	}

	// js typescript mjs cjs etc
	if (args.skipJs !== undefined) {
		pattern.include.push('**/*.{js,jsx,ts,tsx,mjs,cjs}')
	}

	if (args.skipBlockJson !== undefined) {
		pattern.include.push('block.json')
	}

	if (args.skipThemeJson !== undefined) {
		pattern.include.push('theme.json')
	}

	if (args.skipAudit !== undefined) {
		const stringsJson = (await getStrings(args, pattern)) as TranslationString[]
		// merge all strings collecting duplicates and returning the result as the default gettext format
		return consolidateTranslations(stringsJson)
	} else {
		return pattern.include.join('\n')
	}
}
