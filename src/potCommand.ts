import { makePot } from "./parser/makePot.js";

import type { Args } from "./types.js";
import { printModuleInfo, printTimeElapsed } from "./utils/common.js";

export default function potCommand(args: Args) {
	if (Object.keys(args).length > 0) {
		printModuleInfo();
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
