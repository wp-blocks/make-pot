import { makePot } from "./parser/makePot.js";

import type { Args } from "./types.js";
import { printHeader, printTimeElapsed } from "./utils/common";

export default function potCommand(args: Args) {
	if (Object.keys(args).length > 0) {
		printHeader();
		/* capture the start time */
		const timeStart = new Date();
		/** make the pot file */
		makePot(args)
			.then(() => {
				/* output the end time */
				printTimeElapsed(timeStart);
			})
			.catch((error) => {
				console.error(`🫤 Make-pot - Error: ${error}`);
			});
	}
}
