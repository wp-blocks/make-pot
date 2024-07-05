import fs, { accessSync } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import type * as yargs from "yargs";
import { DEFAULT_EXCLUDED_PATH } from "../const.js";
import type { Args, DomainType, MakeJsonArgs } from "../types.js";
import { stringstring } from "../utils/common.js";

/**
 * This function checks if the current working directory is a theme or plugin
 * @param currentPath The current working directory
 * @param slug The slug of the theme or plugin
 */
function isThemeOrPlugin(currentPath = "/", slug = "default"): DomainType {
	const currentWorkingDirectory = currentPath;

	try {
		accessSync(
			path.join(currentWorkingDirectory, `${slug}.php`),
			fs.constants.R_OK,
		);
		return "plugin";
	} catch (err) {
		// do nothing
		console.log(
			`the current working directory ${currentWorkingDirectory} does not contain a ${slug}.php file`,
		);
	}

	try {
		accessSync(
			path.join(currentWorkingDirectory, "style.css"),
			fs.constants.R_OK,
		);
		return "theme";
	} catch (err) {
		// do nothing
		console.log(
			`the current working directory ${currentWorkingDirectory} does not contain a style.css file`,
		);
	}

	if (currentWorkingDirectory.includes(`wp-content${path.sep}themes`)) {
		return "theme";
	}
	if (currentWorkingDirectory.includes(`wp-content${path.sep}plugins`)) {
		return "plugin";
	}
	return "generic";
}

/**
 * Parses the command line arguments and returns an object with the parsed values.
 *
 * @param {{_: string[]}} args - The command line arguments to be parsed.
 * @return {object} - An object with the parsed values from the command line arguments.
 */
export function parseCliArgs(
	args: yargs.PositionalOptions & yargs.Options & yargs.Arguments,
): Args {
	// Get the input and output paths
	const inputPath: string =
		typeof args._[0] === "string" ? args._[0].toString() : ".";
	const outputPath: string =
		typeof args._[1] === "string" ? args._[1].toString() : ".";
	const currentWorkingDirectory = process.cwd();
	const slug =
		args.slug && typeof args.slug === "string"
			? args.slug
			: path.basename(path.resolve(currentWorkingDirectory, inputPath));
	const cwd = path.relative(currentWorkingDirectory, inputPath);
	const out = path.relative(currentWorkingDirectory, outputPath);

	/** get the domain to look for (plugin, theme, etc) */
	const domain =
		(args?.domain as DomainType) ?? isThemeOrPlugin(path.resolve(cwd), slug);

	const parsedArgs: Args = {
		slug: slug,
		domain: domain,
		paths: { cwd: cwd, out: out },
		options: {
			ignoreDomain: !!args?.ignoreDomain,
			packageName: String(args.packageName),
			silent: args.silent === true, // default is false
			json: !!args.json,
			location: !!args?.location,
			output: !!args?.output,
			fileComment: args.fileComment ? String(args.fileComment) : undefined,
			skip: {
				js: !!args.skipJs,
				php: !!args.skipPhp,
				blade: !!args.skipBlade,
				blockJson: !!args.skipBlockJson,
				themeJson: !!args.skipThemeJson,
				audit: !!args.skipAudit,
			},
		},
		// Patterns
		patterns: {
			mergePaths: stringstring(args.mergePaths as string) ?? [],
			subtractPaths: stringstring(args.subtractPaths as string) ?? [],
			subtractAndMerge: !!args.subtractAndMerge,
			include: stringstring(args.include as string) ?? ["**"],
			exclude: stringstring(args.exclude as string) ?? DEFAULT_EXCLUDED_PATH,
		},
	};

	parsedArgs.paths.root = args.root ? String(args.root) : undefined;

	return parsedArgs;
}

/**
 * Parses the command line arguments for the JSON command.
 * @param args - The command line arguments to be parsed.
 */
export function parseJsonArgs(
	args: yargs.PositionalOptions & yargs.Options & yargs.Arguments,
): MakeJsonArgs {
	// Get the input and output paths
	const inputPath: string =
		typeof args._[0] === "string" ? args._[0].toString() : "";
	const outputPath: string =
		typeof args._[1] === "string" ? args._[1].toString() : inputPath;
	const currentWorkingDirectory = process.cwd();
	const slug =
		args.slug && typeof args.slug === "string"
			? args.slug
			: path.basename(path.resolve(currentWorkingDirectory, inputPath));

	return {
		slug: slug,
		source: inputPath,
		destination: outputPath,
		allowedFormats: args.allowedFormats as string[] | null,
		purge: !!args.purge,
		prettyPrint: !!args.prettyPrint,
		debug: !!args.debug,
	};
}
