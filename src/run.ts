import { makePot } from "./parser/makePot.js";

import type { Args } from "./types.js";
import { getPkgJsonData } from "./utils/common";

export default function run(args: Args) {
	if (Object.keys(args).length > 0) {
		const { version, name } = getPkgJsonData("name", "version");
		/* print the version */
		console.log(`${name} version: ${version}`);
		/* capture the start time */
		const timeStart = new Date();
		/** make the pot file */
		makePot(args)
			.then(() => {
				/* output the end time */
				const timeEnd = new Date();
				console.log(
					`🚀 Translation Pot file created in ${
						timeEnd.getTime() - timeStart.getTime()
					}ms`,
				);
			})
			.catch((error) => {
				console.error("Error in makePot: " + error);
			});
	}
}
