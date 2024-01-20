import type { Args, Patterns, TranslationStrings } from './types'
import cliProgress, { type SingleBar } from 'cli-progress'
import { parseFile } from './extractors'
import { allowedFiles } from './const'
import { Glob } from 'glob'
import { getFiles } from './glob'
import { consolidate } from './consolidate'
import path from 'path'

/**
 * Initializes a progress bar and returns the progress bar element.
 *
 * @param {Args} args - The argument object containing the source directory and other options.
 * @param {number} filesCount - An array of file names.
 * @return {cliProgress.SingleBar} The progress bar element.
 */
function initProgress(args: Args, filesCount: number): SingleBar | null {
	if (args.options.silent) return null
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
 * @param {string[]} files - An array of file names to search and parse.
 * @return {Promise<TranslationStrings[]>} A promise that resolves to an array of translation strings found in the files.
 */
export async function getStrings(
	args: Args,
	files: Glob<{ cwd: string }>
): Promise<TranslationStrings> {
	const tasks: Promise<TranslationStrings>[] = []

	let progressBar: SingleBar | null = null
	progressBar = initProgress(args, Array.from(files.iterateSync()).length)

	// loop through the files and parse them
	for (const file of files) {
		// get the file extension
		const ext = file.split('.').pop() || undefined
		// check if the extension is allowed
		if (!ext || !allowedFiles.includes(ext)) {
			// log the filepath
			if (progressBar) {
				progressBar.increment(1, {
					filename: `Skipping ${ext} (not a valid file extension)`,
				})
			}
			break
		}

		const task = parseFile(path.resolve(args.paths.cwd, file))

		// log the filepath
		if (progressBar) {
			progressBar.increment(1, {
				filename: file,
			})
		}

		// add the task to the array if it's not null
		if (task !== null) {
			tasks.push(task as Promise<TranslationStrings>)
		}
	}

	const results = await Promise.all(tasks)

	// stop the progress bar if it's not silent
	if (progressBar) progressBar.stop()

	const mergedResult = consolidate(results.filter((r) => r !== null))

	console.log('Strings grouped', results, mergedResult)

	if (!args.options.silent) {
		console.log(
			'📝 Found',
			Object.values(mergedResult).length,
			'group of strings in',
			results.length,
			'files.\n',
			'In total ' +
				Object.values(mergedResult)
					.map((v) => Object.keys(v).length)
					.reduce((acc, val) => acc + val, 0) +
				' strings were found'
		)
	}

	return mergedResult
}

/**
 * Runs the extract process based on the given arguments.
 *
 * @param {Args} args - The arguments for the extract process.
 * @return {Promise<string>} - A promise that resolves with the extracted data.
 */
export async function runExtract(args: Args) {
	const pattern = {
		include: args.patterns.include || [],
		exclude: args.patterns.exclude || [],
		mergePaths: args.patterns.mergePaths,
		subtractPaths: args.patterns.subtractPaths,
		subtractAndMerge: args.patterns.subtractAndMerge,
	} as Patterns

	// Additional logic to handle different file types and formats
	// Exclude blade.php files if --skip-blade is set
	if (
		args.options.skip.php !== undefined ||
		args.options.skip.blade !== undefined
	) {
		if (args.options.skip.blade !== undefined) {
			// php files but not blade.php
			pattern.include.push('**/*.php')
		} else {
			pattern.include.push('**/*.php', '!**/blade.php')
		}
	}

	// js typescript mjs cjs etc
	if (args.options.skip.js !== undefined) {
		pattern.include.push('**/*.{js,jsx,ts,tsx,mjs,cjs}')
	}

	if (args.options.skip.blockJson !== undefined) {
		pattern.include.push('block.json')
	}

	if (args.options.skip.themeJson !== undefined) {
		pattern.include.push('theme.json')
	}

	const files = await getFiles(args, pattern)
	return await getStrings(args, files)
}
