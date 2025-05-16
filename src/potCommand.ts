import { makePot } from "./parser/makePot.js";

import type { Args } from "./types.js";
import { printMakePotModuleInfo, printTimeElapsed } from "./utils/common";

export default function potCommand(args: Args) {
	if (Object.keys(args).length > 0) {
		printMakePotModuleInfo();
		/* capture the start time */
		const timeStart = new Date();
		/** make the pot file */
		makePot(args)
			.then(() => {
				/* output the end time */
				printTimeElapsed("Make-Pot", timeStart);
			})
			.catch((error) => {
				console.error(`🫤 Make-pot - ${error}`);
			});
	}
}
