import type { Args, Patterns, TranslationString } from './types'
import { glob } from 'glob'
import { getParser } from './tree'
import { consolidateTranslations } from './consolidate'
import cliProgress from 'cli-progress'
import { parseFile } from './extractors'

/**
 * Retrieves a list of files based on the provided arguments and patterns.
 *
 * @param {Args} args - The argument object containing the source directory and other options.
 * @param {Patterns} pattern - The pattern object containing the included and excluded file patterns.
 * @return {Promise<string[]>} A promise that resolves to an array of file paths.
 */
export async function getFiles(args: Args, pattern: Patterns) {
	const included = '{' + pattern.included.join(',') + '}'
	const excluded = '{' + pattern.excluded.join(',') + '}'
	return await glob(included, {
		ignore: excluded,
		nodir: true,
		cwd: args.sourceDirectory ?? process.cwd(),
	})
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

	progressBar.start(files.length + 1, 0)

	const tasks: Array<Promise<TranslationString[]>> = []
	files.forEach((file, index) => {
		const task = parseFile({
			filepath: file,
			language: getParser(file),
			stats: { bar: progressBar, index },
		})
		if (task !== null) tasks.push(task as Promise<TranslationString[]>)
	})

	const results = await Promise.all(tasks)

	progressBar.stop()

	// return a promise that resolves to an array of translation strings
	return results.flat().filter((t) => t != null) as TranslationString[]
}

/**
 * Runs the extract process based on the given arguments.
 *
 * @param {Args} args - The arguments for the extract process.
 * @return {Promise<string>} - A promise that resolves with the extracted data.
 */
export async function runExtract(args: Args) {
	const pattern: Patterns = {
		included: args.include ?? [],
		excluded: args.exclude ?? [],
		mergePaths: args.mergePaths ?? [],
		subtractPaths: args.subtractPaths ?? [],
		subtractAndMerge: args.subtractAndMerge ?? false,
	}

	// Additional logic to handle different file types and formats
	// Exclude blade.php files if --skip-blade is set
	if (args.skipPhp !== true || args.skipBlade !== true) {
		if (args.skipBlade !== true) {
			// php files but not blade.php
			pattern.included.push('**/*.php')
		} else {
			pattern.included.push('**/*.php', '!**/blade.php')
		}
	}

	// js typescript mjs cjs etc
	if (args.skipJs !== undefined) {
		pattern.included.push('**/*.{js,jsx,ts,tsx,mjs,cjs}')
	}

	if (args.skipBlockJson !== undefined) {
		pattern.included.push('**/block.json')
	}

	if (args.skipThemeJson !== undefined) {
		pattern.included.push('**/theme.json')
	}

	if (args.skipAudit !== undefined) {
		const stringsJson = (await getStrings(args, pattern)) as TranslationString[]
		// merge all strings collecting duplicates and returning the result as the default gettext format
		return consolidateTranslations(stringsJson)
	} else {
		return pattern.included.join('\n')
	}
}
