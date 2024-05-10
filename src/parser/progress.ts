import cliProgress, { type SingleBar } from "cli-progress";
import type { Args } from "../types.js";

/**
 * Initializes a progress bar and returns the progress bar element.
 *
 * @param {Args} args - The argument object containing the source directory and other options.
 * @param {number} filesCount - An array of file names.
 * @return {cliProgress.SingleBar} The progress bar element.
 */
export function initProgress(
	args: Args,
	filesCount: number,
): SingleBar | undefined {
	if (args.options?.silent) return undefined;
	// Set up the progress bar
	const progressBar = new cliProgress.SingleBar(
		{
			clearOnComplete: true,
			etaBuffer: 1000,
			hideCursor: true,
			format:
				" {bar} {percentage}% | ETA: {eta}s | {filename} | {value}/{total}",
		},
		cliProgress.Presets.shades_classic,
	);

	progressBar.start(filesCount, 0);

	// Return the progress bar element
	return progressBar;
}
