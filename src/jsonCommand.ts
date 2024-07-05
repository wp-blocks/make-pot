#!/usr/bin/env node

import { getJsonArgs } from "./cli/getJsonArgs";
import MakeJsonCommand from "./parser/makeJson";
import { printHeader, printTimeElapsed } from "./utils/common";

const makeJsonCommand = new MakeJsonCommand();

const args = getJsonArgs();

if (Object.keys(args).length > 0) {
	printHeader();
	/* capture the start time */
	const timeStart = new Date();
	makeJsonCommand
		.invoke(args)
		.then((result) => {
			if (result) {
				console.log(result);
			}
			/* output the end time */
			printTimeElapsed(timeStart);
		})
		.catch((error) => {
			console.error(`🫤 make-json - Error: ${error}`);
		});
}
