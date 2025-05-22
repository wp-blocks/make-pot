import fs, { accessSync } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import type * as yargs from "yargs";
import { DEFAULT_EXCLUDED_PATH } from "../const.js";
import { getEncodingCharset } from "../fs/fs";
import type { Args, DomainType, MakeJsonArgs } from "../types.js";
import type { PotHeaders } from "../types.js";
import { stringstring } from "../utils/common.js";

/**
 * This function checks if the current working directory is a theme or plugin
 * @param currentPath The current working directory
 * @param slug The slug of the theme or plugin
 */
function isThemeOrPlugin(currentPath = "/", slug = "default"): DomainType {
	const currentWorkingDirectory = currentPath;

	/**
	 * Checks if the current working directory contains a plugin file
	 */
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

	/**
	 * Checks if the current working directory contains a style.css file and is a theme
	 */
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

	// If none of the above conditions are met, return "generic"
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
	const pos1: string | undefined = args._[0]?.toString();
	const pos2: string = args._[1]?.toString() || "languages";

	const inputPath: string | undefined = pos1 ?? ".";
	// remove "/" if the output path starts with it
	const outputPath: string = pos2.startsWith("/") ? pos2.slice(1) : pos2;

	// Store the current working directory
	const currentWorkingDirectory = process.cwd();

	// Get the slug or use the basename of the current working directory
	// the slug is the plugin or theme slug. Defaults to the source directory’s basename
	const slug =
		args.slug && typeof args.slug === "string"
			? args.slug
			: path.basename(path.resolve(currentWorkingDirectory, inputPath));

	// Get the relative paths
	const cwd = path.relative(currentWorkingDirectory, inputPath);
	const out = path.relative(currentWorkingDirectory, outputPath);

	/** get the domain to look for (plugin, theme, etc) */
	if (!(args?.domain as DomainType)) {
		args.domain = isThemeOrPlugin(path.resolve(cwd), slug);
	} else {
		switch (args.domain) {
			case "plugin":
			case "theme":
			case "block":
			case "theme-block":
				break;
			default:
				console.error(
					`Invalid domain: ${args.domain}. Valid domains are: plugin, theme, block, theme-block, generic`,
				);
				// fallback to generic if the domain is invalid
				args.domain = "generic";
		}
	}

	// Collect the headers passed via cli
	const headers = {};
	for (const header of args.headers) {
		const [key, value] = header.split(":") as Record<PotHeaders, string>;
		headers[key.trim()] = value.trim();
	}

	const parsedArgs: Args = {
		slug: slug,
		debug: !!args.debug,
		domain: args.domain as DomainType,
		paths: { cwd: cwd, out: out },
		options: {
			ignoreDomain: !!args?.ignoreDomain,
			packageName: String(args.packageName),
			silent: args.silent === true, // default is false
			json: !!args.json,
			location: !!args?.location,
			headers: headers as Record<PotHeaders, string>,
			theme: !!args?.theme,
			output: !!args?.output,
			fileComment: args.fileComment ? String(args.fileComment) : undefined,
			charset: getEncodingCharset(args?.charset as string | undefined),
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
			mergePaths: stringstring(args.mergePaths as string),
			subtractPaths: stringstring(args.subtractPaths as string),
			subtractAndMerge: !!args.subtractAndMerge,
			include: stringstring(args.include as string),
			exclude: [
				...stringstring(args.exclude as string),
				...DEFAULT_EXCLUDED_PATH,
			],
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
	const inputPath: string = (args._[0] as string) || "build";
	const outputPath: string = (args._[1] as string) || "languages";
	const currentWorkingDirectory = process.cwd();
	const slug = path.basename(path.resolve(currentWorkingDirectory));

	let scriptName = undefined;
	if (args.scriptName) {
		scriptName = args.scriptName.split(",").map((s) => s.trim());
		if (scriptName.length === 1) {
			scriptName = scriptName[0];
		}
	}

	return {
		timeStart: Date.now(),
		slug,
		source: inputPath,
		destination: outputPath,
		scriptName,
		allowedFormats: args.allowedFormats as string[],
		purge: !!args.purge,
		stripUnused: !!args.stripUnused,
		prettyPrint: !!args.prettyPrint,
		debug: !!args.debug,
		paths: {
			cwd: currentWorkingDirectory,
			out: path.join(currentWorkingDirectory, outputPath),
		},
	};
}
