import type { Args, Patterns } from "../types.js";

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
	} as Patterns;

	// Additional logic to handle different file types and formats
	if (args.options) {
		// js typescript mjs cjs etc
		if (args.options.skip.blade) {
			pattern.exclude.push("**/blade.php");
		} else if (args.options.skip.php) {
			pattern.exclude.push("**/*.php", "**/*.blade.php");
		}

		// js typescript mjs cjs etc
		if (args.options.skip.js) {
			pattern.exclude.push("**/*.{js,jsx,ts,tsx,mjs,cjs}");
		}

		if (args.options.skip.blockJson) {
			pattern.exclude.push("block.json");
		}

		if (args.options.skip.themeJson) {
			pattern.exclude.push("theme.json");
		}
	}

	return pattern;
}
