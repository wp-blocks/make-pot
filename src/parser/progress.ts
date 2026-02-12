import cliProgress, { type SingleBar } from "cli-progress";
import type { Args } from "../types.js";

/**
 * Initializes a progress bar and returns the progress bar element.
 *
 * @param {Args} _args - The argument object containing the source directory and other options.
 * @param {number} _filesCount - An array of file names.
 * @return {cliProgress.SingleBar} The progress bar element.
 */
export function initProgress(_args: Args, _filesCount: number): SingleBar {
	// Set up the progress bar
	return new cliProgress.SingleBar(
		{
			clearOnComplete: true,
			etaBuffer: 1000,
			hideCursor: true,
			format:
				" {bar} {percentage}% | ETA: {eta}s | {filename} | {value}/{total}",
		},
		cliProgress.Presets.shades_classic,
	);
}
