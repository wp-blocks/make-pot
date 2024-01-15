#!/usr/bin/env node
import { makePot } from "./makePot";

import { args } from "./cliArgs";

import yargs from "yargs";
import { Args } from "./types";

const options = args as yargs.Arguments as Record<string, string>;

// Main execution
if (Object.keys(options).length > 0) {
  const timeStart = new Date();
  makePot(options)
    .then(() => {
      const timeEnd = new Date();
      console.log(
        `🚀 Translation Pot file created in ${timeEnd.getTime() - timeStart.getTime()}ms`,
      );
    })
    .catch((error) => {
      console.error(error);
    });
} else {
  yargs.showHelp();
}
