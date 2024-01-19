import type { Args, Patterns, TranslationStrings } from './types'
import cliProgress, { type SingleBar } from 'cli-progress'
import { parseFile } from './extractors'
import { allowedFiles } from './const'
import { Glob, Path } from 'glob'
import { minimatch } from 'minimatch'
import Parser from 'tree-sitter'

// @ts-expect-error
import Js from 'tree-sitter-javascript'
// @ts-expect-error
import Php from 'tree-sitter-php'
// @ts-expect-error
import Ts from 'tree-sitter-typescript'
import path from 'path'
import gettextParser, { GetTextTranslations } from 'gettext-parser'
import { generateHeaderComments } from './utils'
import { consolidate } from './consolidate'

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
 * Determines if a pattern represents a file, a directory, or a glob pattern.
 * @param pattern - The pattern string to evaluate.
 * @returns 'file', 'directory', or 'glob'.
 */
export function detectPatternType(
	pattern: string
): 'file' | 'directory' | 'glob' {
	const containsFileExtension = pattern.includes('.')
	const containsDirectorySeparator =
		pattern.includes(path.sep) || pattern.endsWith(path.sep)

	if (pattern.includes('*')) {
		return 'glob'
	} else if (!containsFileExtension && !containsDirectorySeparator) {
		return 'directory'
	} else if (containsFileExtension && !containsDirectorySeparator) {
		return 'file'
	} else {
		return 'glob'
	}
}

export function includeFunction(includePath: string[]) {
	return includePath.map((path) => {
		const type = detectPatternType(path)
		switch (type) {
			case 'directory':
				return '**/' + path + '/**'
			case 'file':
				return '**/' + path
			default:
				return path
		}
	})
}

/**
 * Retrieves a list of files based on the provided arguments and patterns.
 *
 * @param {Args} args - The argument object containing the source directory and other options.
 * @param {Patterns} pattern - The pattern object containing the included and excluded file patterns.
 * @return A promise that resolves to an array of file paths.
 */
export async function getFiles(args: Args, pattern: Patterns) {
	const includedPatterns = includeFunction(
		pattern.include.map((p) => p.trim()).filter((p) => p)
	) ?? ['**']

	// Process excludePaths
	const excludedPatterns = pattern.exclude ?? []

	// Build the ignore function for Glob
	const ignoreFunc = (filePath: Path): boolean => {
		return excludedPatterns.some((exclude) => {
			const type = detectPatternType(exclude)
			switch (type) {
				case 'file':
					return filePath.name === exclude
				case 'directory':
					return filePath.path.includes(exclude)
				default:
					// Handle glob patterns using minimatch or a similar library
					return minimatch(filePath.path, exclude)
			}
		}) as boolean
	}

	if (!args.silent)
		console.log(
			'Searching in :',
			path.resolve(args.sourceDirectory),
			'for ' + includeFunction(includedPatterns).join(),
			'\nExcluding : ' + excludedPatterns.join()
		)

	// Execute the glob search with the built patterns
	return new Glob(includedPatterns, {
		ignore: {
			ignored: (p) => {
				return ignoreFunc(p)
			},
		},
		nodir: true,
		cwd: args.sourceDirectory,
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
 * @param {string[]} files - An array of file names to search and parse.
 * @return {Promise<TranslationStrings[]>} A promise that resolves to an array of translation strings found in the files.
 */
export async function getStrings(
	args: Args,
	files: Glob<{}>
): Promise<TranslationStrings> {
	const tasks: Promise<TranslationStrings>[] = []

	const progressBar = initProgress(
		args,
		Array.from(files.iterateSync()).length
	)

	// loop through the files and parse them
	for (const file of files) {
		// get the file extension
		const ext = file.split('.').pop() || 'undefined'
		// check if the extension is allowed
		if (!allowedFiles.includes(ext)) {
			// log the filepath
			if (progressBar) {
				progressBar.increment(1, {
					filename: `Skipping ${ext} (not a valid file extension)`,
				})
			}
			continue
		}

		const task = parseFile({
			filepath: path.join(process.cwd(), args.sourceDirectory, file),
			language: getParser(file),
		}) as Promise<TranslationStrings>

		// log the filepath
		if (progressBar) {
			progressBar.increment(1, {
				filename: file,
			})
		}

		// add the task to the array if it's not null
		if (task !== null) tasks.push(task as Promise<TranslationStrings>)
	}

	const results = await Promise.all(tasks)

	// stop the progress bar if it's not silent
	if (progressBar) progressBar.stop()

	const mergedResult = consolidate(results.filter((r) => r !== null).flat())

	console.log('Strings grouped')

	if (!args.silent) {
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
		include: args.include || [],
		exclude: args.exclude || [],
		mergePaths: args.mergePaths,
		subtractPaths: args.subtractPaths,
		subtractAndMerge: args.subtractAndMerge,
	} as Patterns

	// Additional logic to handle different file types and formats
	// Exclude blade.php files if --skip-blade is set
	if (args.skipPhp !== undefined || args.skipBlade !== undefined) {
		if (args.skipBlade !== undefined) {
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

	const files = await getFiles(args, pattern)
	const stringsJson = await getStrings(args, files)

	const additionalHeaders = {
		'content-type': 'text/plain; charset=iso-8859-1',
		...args.headers,
		'plural-forms': 'nplurals=2; plural=(n != 1);',
	}

	const buffer = gettextParser.po.compile(
		{
			headers: additionalHeaders,
			comments: generateHeaderComments(args),
			translations: stringsJson,
			charset: 'iso-8859-1',
		} as unknown as GetTextTranslations,
		{
			sort: true,
		}
	)

	return buffer.toString('utf-8') as string
}
