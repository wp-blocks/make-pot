import path from 'node:path'
import { Glob, type Path } from 'glob'
import { minimatch } from 'minimatch'
import * as javascript from 'tree-sitter-javascript'
// @ts-expect-error
import * as php from 'tree-sitter-php'
// @ts-expect-error
import * as ts from 'tree-sitter-typescript'
import type { Args, Patterns } from '../types.js'
import { detectPatternType, getFileExtension } from '../utils/common.js'

/**
 * Return the parser based on the file extension
 *
 * @param file - Path to the file
 * @return {Parser|null} - the parser to be used with the file or null if no parser is found
 */
export function getParser(
	file: string,
): string | { name: string; language: unknown } | null {
	const ext = getFileExtension(file);
	switch (ext) {
		case "ts":
			return ts.typescript;
		case "tsx":
			return ts.tsx;
		case "js":
		case "jsx":
		case "mjs":
		case "cjs":
			return javascript;
		case "php":
			return php.php;
		case "blade.php":
			return php.php_only;
		default:
			return null;
	}
}

/**
 * Classify exclude patterns into directory names (for tree pruning)
 * and file/glob patterns (for per-file filtering).
 */
export function classifyExcludes(excludedPatterns: string[]) {
	const dirs: string[] = [];
	const filePatterns: string[] = [];
	for (const exclude of excludedPatterns) {
		const type = detectPatternType(exclude);
		if (type === "directory") {
			dirs.push(exclude);
		} else {
			filePatterns.push(exclude);
		}
	}
	return { dirs, filePatterns };
}

/**
 * Retrieves a list of files based on the provided arguments and patterns.
 *
 * @param {Args} args - The argument object containing the source directory and other options.
 * @param {Patterns} pattern - The pattern object containing the included and excluded file patterns.
 * @return A promise that resolves to an array of file paths.
 */
export async function getFiles(args: Args, pattern: Patterns): Promise<string[]> {
	const { dirs, filePatterns } = classifyExcludes(pattern.exclude);

	const g = new Glob(pattern.include, {
		ignore: {
			// Prune entire directory subtrees — glob won't enter these dirs at all
			childrenIgnored: (p: Path) => dirs.some((d) => p.isNamed(d)),
			// Filter individual files by name or glob pattern
			ignored: (p: Path) =>
				filePatterns.some((fp) => {
					const type = detectPatternType(fp);
					if (type === "file") {
						return p.isNamed(fp);
					}
					return minimatch(p.relative(), fp);
				}),
		},
		nodir: true,
		cwd: args.paths.cwd,
		root: args.paths.root ? path.resolve(args.paths.root) : undefined,
	});

	return g.walk();
}
