import { makePot } from "./parser/makePot.js";

import type { Args } from "./types.js";
import { printModuleInfo, printTimeElapsed } from "./utils/common.js";

export default function potCommand(args: Args) {
	if (Object.keys(args).length > 0) {
		printModuleInfo();
		/** make the pot file */
		makePot(args)
			.then(() => {
				/* output the end time */
				printTimeElapsed("Make-Pot", args.timeStart);
			})
			.catch((error) => {
				console.error(`🫤 Make-pot - ${error}`);
			});
	}
}
