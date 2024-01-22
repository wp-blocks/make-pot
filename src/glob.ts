import Parser from 'tree-sitter'
import path from 'path'
import type { Args, Patterns } from './types'
import { Glob, Path } from 'glob'
import { minimatch } from 'minimatch'

// @ts-ignore
import * as Javascript from 'tree-sitter-javascript'
// @ts-ignore
import * as Ts from 'tree-sitter-typescript'
// @ts-ignore
import * as Php from 'tree-sitter-php'
import { detectPatternType } from './utils'

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
			return Ts.default.typescript
		case 'tsx':
			return Ts.default.tsx
		case 'js':
		case 'jsx':
		case 'mjs':
		case 'cjs':
			return Javascript.default
		case 'php':
			return Php.default
		default:
			return ext!
	}
}

// Build the ignore function for Glob
export const ignoreFunc = (
	filePath: Path,
	excludedPatterns: string[]
): boolean => {
	return excludedPatterns.some((exclude) => {
		const type = detectPatternType(exclude)
		// return true to ignore
		switch (type) {
			case 'file':
				return filePath.isNamed(exclude)
			case 'directory':
				return filePath.relative().includes(exclude)
			default:
				// Handle glob patterns using minimatch
				return minimatch(filePath.relative(), exclude)
		}
	}) as boolean
}

/**
 * Retrieves a list of files based on the provided arguments and patterns.
 *
 * @param {Args} args - The argument object containing the source directory and other options.
 * @param {Patterns} pattern - The pattern object containing the included and excluded file patterns.
 * @return A promise that resolves to an array of file paths.
 */
export async function getFiles(args: Args, pattern: Patterns) {
	if (!args.options?.silent)
		console.log(
			'Searching in :',
			path.resolve(args.paths.cwd),
			'for ' + pattern.include.join(),
			'\nignoring patterns: ' + pattern.exclude.join()
		)

	// Execute the glob search with the built patterns
	return new Glob(pattern.include, {
		ignore: {
			ignored: (p: Path) => ignoreFunc(p, pattern.exclude),
		},
		nodir: true,
		cwd: args.paths.cwd,
		root: args.paths.root ? path.resolve(args.paths.root) : undefined,
	})
}
