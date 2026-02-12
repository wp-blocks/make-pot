import path from "node:path";
import type { SingleBar } from "cli-progress";
import { type GetTextTranslations, po } from "gettext-parser";
import { audit } from "../extractors/auditStrings.js";
import { generateHeader, translationsHeaders } from "../extractors/headers.js";
import { getCharset, getEncodingCharset } from "../fs/fs.js";
import type { Args } from "../types.js";
import { getCopyright, outputPathRecap, printStats } from "../utils/common.js";
import { outputJson } from "../utils/output";
import { getPatterns } from "./patterns.js";
import { processFiles } from "./process.js";
import { initProgress } from "./progress.js";
import { taskRunner } from "./taskRunner.js";

/**
 * Runs the parser and generates the pot file or the json file based on the command line arguments
 *
 * @param {Args} args - The command line arguments
 * @return {Promise<string>} - A promise that resolves with the generated pot file
 */
export async function exec(args: Args): Promise<string> {
	if (!args.options?.silent) {
		console.log("📝 Starting makePot for", args?.slug);
		printStats();
	}

	/** The pot file header contains the data about the plugin or theme */
	const potHeader = await generateHeader(args);

	/** We need to find the main file data so that the definitions are extracted from the plugin or theme files */
	let translationsUnion = translationsHeaders(args);

	if (!args.options?.silent)
		outputPathRecap(path.resolve(args.paths.cwd), args.patterns);

	/**
	 * The progress bar that is used to show the progress of the extraction process.
	 */
	const progressBar: SingleBar = initProgress(args, 0);
	progressBar.start(3, 1, {
		filename: `Resolving files in ${path.resolve(args.paths.cwd)}`,
	});

	/**
	 * Extract the strings from the files
	 */
	const patterns = getPatterns(args);
	const files = await processFiles(patterns, args);

	progressBar.update(2, {
		filename: `Found ${files.length} files... `,
	});

	translationsUnion = await taskRunner(
		files,
		translationsUnion,
		args,
		progressBar,
	);

	/**
	 * Audit Strings: Strings are validated and reported to the user if they are not compliant.
	 * --skip-audit flag turns this off
	 **/
	if (!args.options?.skip.audit) {
		console.log("\nAudit strings...");
		audit(args, translationsUnion);
	}

	/** generate the JSON file based on the --json flag passed */
	if (args.options?.json) {
		return outputJson(args, potHeader, translationsUnion);
	}

	/** Generate the pot file JSON */
	const getTextTranslations: GetTextTranslations = {
		charset: getEncodingCharset(args.options?.charset),
		headers: potHeader as { [headerName: string]: string },
		translations: translationsUnion.toJson(),
	};

	/** And then compile the pot file to a string */
	const pluginTranslations = po
		.compile(getTextTranslations)
		.toString(getCharset(args.options?.charset));

	/** Return the pot file as a string, prefixed with the header */
	const copyrightComment =
		args.options?.fileComment ||
		getCopyright(
			args.headers?.name || args.slug,
			(args.headers?.license as string) ?? "GPL v2 or later",
		);
	return `${copyrightComment}\n${pluginTranslations}`;
}
