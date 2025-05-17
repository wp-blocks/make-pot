import MakeJsonCommand from "./parser/makeJson";
import type { MakeJsonArgs } from "./types";
import { printMakePotModuleInfo, printTimeElapsed } from "./utils/common";

export default function makeJsonCommand(args: MakeJsonArgs) {
	const makeJsonCommand = new MakeJsonCommand(args);

	if (Object.keys(args).length > 0) {
		printMakePotModuleInfo();
		/* capture the start time */
		const timeStart = new Date();
		makeJsonCommand
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
