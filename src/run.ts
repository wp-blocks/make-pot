import { makePot } from "./parser/index.js";

import { pkgJson } from "./const.js";
import type { Args } from "./types.js";

export default function run(args: Args) {
	if (Object.keys(args).length > 0) {
		/* print the version */
		console.log(pkgJson.name + " version: " + pkgJson.version);
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
				console.error(error);
			});
	}
}
