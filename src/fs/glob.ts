import path from "node:path";
import { Glob, type Path } from "glob";
import { minimatch } from "minimatch";
// @ts-expect-error
import * as javascript from "tree-sitter-javascript";
// @ts-expect-error
import * as php from "tree-sitter-php";
// @ts-expect-error
import * as ts from "tree-sitter-typescript";
import type { Args, Patterns } from "../types.js";
import { detectPatternType, getFileExtension } from "../utils/common.js";

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

// Build the ignore function for Glob
export const ignoreFunc = (
	filePath: Path,
	excludedPatterns: string[],
): boolean => {
	return excludedPatterns.some((exclude) => {
		const type = detectPatternType(exclude);
		// return true to ignore
		switch (type) {
			case "file":
				return filePath.isNamed(exclude);
			case "directory":
				return filePath.relative().includes(exclude);
			default:
				// Handle glob patterns using minimatch
				return minimatch(filePath.relative(), exclude);
		}
	}) as boolean;
};

/**
 * Retrieves a list of files based on the provided arguments and patterns.
 *
 * @param {Args} args - The argument object containing the source directory and other options.
 * @param {Patterns} pattern - The pattern object containing the included and excluded file patterns.
 * @return A promise that resolves to an array of file paths.
 */
export function getFiles(args: Args, pattern: Patterns) {
	// Execute the glob search with the built patterns
	return new Glob(pattern.include, {
		ignore: {
			ignored: (p: Path) => ignoreFunc(p, pattern.exclude),
		},
		nodir: true,
		cwd: args.paths.cwd,
		root: args.paths.root ? path.resolve(args.paths.root) : undefined,
	});
}
