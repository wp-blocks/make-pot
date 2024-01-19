import Parser from 'tree-sitter'
import path from 'path'
import type { Args, Patterns } from './types'
import { Glob, Path } from 'glob'
import { minimatch } from 'minimatch'

// @ts-ignore
import Javascript from 'tree-sitter-javascript'
// @ts-ignore
import Ts from 'tree-sitter-typescript'
// @ts-ignore
import Php from 'tree-sitter-php'

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
			return Javascript
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
