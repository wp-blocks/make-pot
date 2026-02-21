import * as os from "node:os";
import path from "node:path";
import type { SingleBar } from "cli-progress";
import type { SetOfBlocks } from "gettext-merger";
import type { Args } from "../types.js";

/**
 * Task runner for the extraction process.
 *
 * @param tasks - The tasks to run
 * @param destination - The destination
 * @param args - The command line arguments
 * @param progressBar
 */
export async function taskRunner(
	tasks: Promise<SetOfBlocks>[],
	destination: SetOfBlocks,
	args: Args,
	progressBar: SingleBar,
) {
	// Create a new array of promises that update the bar when they finish.
	const tasksWithProgress = tasks.map((task) =>
		task.then((result) => {
			progressBar.increment({
				filename: result.path ? path.basename(result.path) : "",
			});
			return result;
		}).catch((err) => {
			progressBar.increment({ filename: "error" });
			throw err;
		})
	);
	await Promise.allSettled(tasksWithProgress)
		.then((strings) => {
			/**
			 * Return the strings that are not rejected (they are fulfilled)
			 */
			return strings
				.map((block) => block.status === "fulfilled" && block.value)
				.filter(Boolean) as SetOfBlocks[]; // remove nullish
		})
		.then((consolidated) => {
			/** Log the results */
			for (const result of consolidated) {
				if (result.blocks.length > 0) {
					/**
					 * Add the strings to the destination set
					 */
					destination.addArray(result.blocks);
				}
			}
		})
		.catch((err) => {
			return new Error(err);
		});

	progressBar.stop();

	return destination;
}
