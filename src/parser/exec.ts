import { cpus, totalmem } from "node:os";
import type { SingleBar } from "cli-progress";
import { type GetTextTranslations, po } from "gettext-parser";
import { generateHeader, translationsHeaders } from "../extractors/headers.js";
import { getCharset } from "../fs/fs";
import type { Args } from "../types.js";
import { getCopyright } from "../utils/common.js";
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
		console.log(
			"Memory usage:",
			(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			"MB (Free:",
			(totalmem() / 1024 / 1024 / 1024).toFixed(2),
			"GB)\nCpu User:",
			(process.cpuUsage().user / 1000000).toFixed(2),
			"ms Cpu System:",
			(process.cpuUsage().system / 1000000).toFixed(2),
			"ms of",
			cpus().length,
			"cores",
		);
	}

	// audit
	if (args.options?.skip.audit) {
		console.log("Audit strings...");
		/** TODO audit strings */
		console.log("✅ Done");
	}

	/** The pot file header contains the data about the plugin or theme */
	const potHeader = generateHeader(args);

	const copyrightComment =
		args.options?.fileComment ||
		getCopyright(
			args.slug,
			(args.headers?.license as string) ?? "GPL v2 or later",
		);

	/** We need to find the main file data so that the definitions are extracted from the plugin or theme files */
	let translationsUnion = translationsHeaders(args);

	/**
	 * Extract the strings from the files
	 */
	const patterns = getPatterns(args);

	/**
	 * The progress bar that is used to show the progress of the extraction process.
	 */
	const progressBar: SingleBar | undefined = initProgress(args, 0) ?? undefined;

	const tasks = await processFiles(patterns, args, progressBar);

	translationsUnion = await taskRunner(
		tasks,
		translationsUnion,
		args,
		progressBar,
	);

	if (progressBar) {
		progressBar.stop();
	}

	if (args.options?.json) {
		// generate the json file
		// TODO: this should compile to Jed-formatted JSON instead of JSON5
		return JSON.stringify([potHeader, translationsUnion.toJson()], null, 4);
	}

	const charset = getCharset(args.options?.charset);

	// generate the pot file json
	const getTextTranslations: GetTextTranslations = {
		charset: charset === "latin1" ? "iso-8859-1" : charset,
		headers: potHeader,
		translations: translationsUnion.toJson(),
	};

	// And then compile the pot file
	const pluginTranslations = po
		.compile(getTextTranslations)
		.toString(charset as BufferEncoding);

	// return the pot file as a string with the header
	return `${copyrightComment}\n${pluginTranslations}`;
}
