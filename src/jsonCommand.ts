import MakeJsonCommand from "./parser/makeJson.js";
import type { MakeJsonArgs } from "./types.js";
import { printMakePotModuleInfo, printTimeElapsed } from "./utils/common.js";

export default function makeJsonCommand(args: MakeJsonArgs) {
	const makeJson = new MakeJsonCommand(args);

	if (Object.keys(args).length > 0) {
		printMakePotModuleInfo();
		/* capture the start time */
		const timeStart = new Date();
		makeJson
			.exec()
			.then((result) => {
				if (args.debug) {
					console.log(result);
				}
				/* output the end time */
				printTimeElapsed("Make-Json", timeStart);
			})
			.catch((error) => {
				console.error(`🫤 make-json - Error: ${error}`);
			});
	}
}
