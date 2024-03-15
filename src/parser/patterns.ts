import type { Args, Patterns } from '../types'

/**
 * Returns the patterns based on the given arguments.
 *
 * @param args - The arguments for the extract process.
 */
export function getPatterns(args: Args) {
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
		args.options?.skip.php !== undefined ||
		args.options?.skip.blade !== undefined
	) {
		if (args.options?.skip.blade !== undefined) {
			// php files but not blade.php
			pattern.include.push('**/*.php')
		} else {
			pattern.include.push('**/*.php', '!**/blade.php')
		}
	}

	// js typescript mjs cjs etc
	if (args.options?.skip.js !== undefined) {
		pattern.include.push('**/*.{js,jsx,ts,tsx,mjs,cjs}')
	}

	if (args.options?.skip.blockJson !== undefined) {
		pattern.include.push('block.json')
	}

	if (args.options?.skip.themeJson !== undefined) {
		pattern.include.push('theme.json')
	}

	return pattern
}
