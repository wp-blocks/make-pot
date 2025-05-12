#!/usr/bin/env node

import process from "node:process";
import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { getArgs } from "./cli/getArgs.js";
import { getJsonArgs } from "./cli/getJsonArgs";
import makeJsonCommand from "./jsonCommand";
import makepotCommand from "./potCommand";
import type { Args, MakeJsonArgs } from "./types";

/** Main execution */
// Get the selected command
const r = yargs
	.default(hideBin(process.argv))
	.options({
		makejson: {
			describe: "Make JSON file",
			type: "boolean",
			default: false,
		},
	})
	.parseSync() as { makejson: boolean };

// Execute the command
if (!r.makejson) {
	makepotCommand(getArgs() as Args);
} else {
	makeJsonCommand(getJsonArgs() as MakeJsonArgs);
}
