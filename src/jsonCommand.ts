import MakeJsonCommand from "./parser/makeJson";
import type { MakeJsonArgs } from "./types";
import { printMakePotModuleInfo, printTimeElapsed } from "./utils/common";

function makeJsonCommand(args: MakeJsonArgs) {
	const makeJsonCommand = new MakeJsonCommand(args);

	if (Object.keys(args).length > 0) {
		printMakePotModuleInfo();
		/* capture the start time */
		const timeStart = new Date();
		makeJsonCommand
			.invoke()
			.then((result) => {
				if (args.debug) {
					console.log(result);
				}
				/* output the end time */
				printTimeElapsed(timeStart);
			})
			.catch((error) => {
				console.error(`🫤 make-json - Error: ${error}`);
			});
	}
}

export default makeJsonCommand;
