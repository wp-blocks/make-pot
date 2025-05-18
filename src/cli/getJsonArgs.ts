import process from "node:process";
import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { MakeJsonArgs } from "../types.js";
import { parseJsonArgs } from "./parseCli.js";

/**
 * Parses the command line arguments for the JSON command.
 *
 * @param additionalArgs - Additional arguments to be parsed.
 * @returns The parsed command line arguments.
 */
export function getJsonArgs(additionalArgs = {}): MakeJsonArgs {
	const args = yargs
		.default(hideBin(process.argv))
		.help("h")
		.alias("help", "help")
		.usage("Usage: $0 <source> [destination] [options]")
		.positional("source", {
			describe: "Source directory",
			type: "string",
		})
		.positional("destination", {
			describe: "Destination directory",
			type: "string",
		})
		.options({
			scriptName: {
				describe: "The name of the script to be translated",
				type: "string",
			},
			allowedFormats: {
				describe: "which extensions to use for translation",
				type: "array",
				default: ["js"],
			},
			purge: {
				describe: "Remove old JSON files",
				type: "boolean",
				default: true,
			},
			prettyPrint: {
				describe: "Pretty print JSON",
				type: "boolean",
				default: false,
			},
			debug: {
				describe: "Debug mode",
				type: "boolean",
				default: false,
			},
			stripUnused: {
				describe: "Strip unused translations in js files",
				type: "boolean",
				default: true,
			},
		})
		.parseSync();
	return parseJsonArgs({ ...additionalArgs, ...args });
}
