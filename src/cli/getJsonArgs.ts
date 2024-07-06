import process from "node:process";
import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { MakeJsonArgs } from "../types";
import { parseJsonArgs } from "./parseCli";

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
			},
			purge: {
				describe: "Remove old POT files",
				type: "boolean",
			},
			prettyPrint: {
				describe: "Pretty print JSON",
				type: "boolean",
			},
			debug: {
				describe: "Debug mode",
				type: "boolean",
			},
		})
		.parseSync();
	return parseJsonArgs({ ...additionalArgs, ...args });
}
