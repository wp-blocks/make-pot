import process from "node:process";
import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { Args, MakeJsonArgs } from "../types.js";
import { parseCliArgs } from "./parseCli.js";

/**
 * Retrieves and returns the command line arguments and options.
 *
 * @return The parsed command line arguments and options.
 */
export function getArgs(userArgs = {}): Args | MakeJsonArgs {
	const args = yargs
		.default(hideBin(process.argv))
		.help("help")
		.alias("h", "help")
		.usage("Usage: $0 <source> [destination] [options]")
		.positional("sourceDirectory", {
			describe: "Source directory",
			type: "string",
		})
		.positional("destination", {
			describe: "Destination directory",
			type: "string",
		})
		.options({
			slug: {
				describe: "Plugin or theme slug",
				type: "string",
			},
			domain: {
				describe: "Text domain to look for in the source code. Valid domains are: plugin, theme, block, theme-block, generic.",
				choices: ["plugin", "theme", "block", "theme-block", "generic"],
				type: "string",
			},
			"skip-js": {
				describe: "Skip JavaScript files",
				type: "boolean",
			},
			"skip-php": {
				describe: "Skip PHP files",
				type: "boolean",
			},
			"skip-blade": {
				describe: "Skip Blade files",
				type: "boolean",
			},
			"skip-block-json": {
				describe: "Skip block.json files",
				type: "boolean",
			},
			"skip-theme-json": {
				describe: "Skip theme.json files",
				type: "boolean",
			},
			"skip-audit": {
				describe: "Skip auditing of strings",
				type: "boolean",
				default: false,
			},
			headers: {
				describe: "Additional Headers",
				type: "array",
				default: [],
			},
			"file-comment": {
				describe: "File comment",
				type: "string",
			},
			"package-name": {
				describe: "Package name",
				type: "string",
			},
			location: {
				describe: "Include location information",
				type: "boolean",
			},
			"ignore-domain": {
				describe: "Ignore text domain",
				type: "boolean",
			},
			mergePaths: {
				describe: "Merge with existing POT file(s)",
				type: "string",
			},
			subtractPaths: {
				describe: "Subtract strings from existing POT file(s)",
				type: "string",
			},
			subtractAndMerge: {
				describe: "Subtract and merge strings from existing POT file(s)",
				type: "boolean",
			},
			include: {
				describe: "Include specific files",
				type: "string",
				default: "**",
			},
			exclude: {
				describe: "Exclude specific files",
				type: "string",
			},
			silent: {
				describe: "No output to stdout",
				type: "boolean",
				default: false,
			},
			json: {
				describe: "Output the json gettext data",
				type: "boolean",
			},
			output: {
				describe: "Output the gettext data",
				type: "boolean",
			},
			charset: {
				describe: "Charset",
				type: "string",
				default: "latin1",
			},
			"translation-domains": {
				describe: "Restrict to specific translation domains",
				type: "array",
			},
			debug: {
				describe: "Debug mode",
				type: "boolean",
				default: false,
			},
		})
		.parseSync();
	return parseCliArgs({ ...userArgs, ...args });
}
