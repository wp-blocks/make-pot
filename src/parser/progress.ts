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
	const FILENAME_WIDTH = 40;
	// Set up the progress bar
	return new cliProgress.SingleBar(
		{
			clearOnComplete: true,
			etaBuffer: 1000,
			hideCursor: true,
			format: (options, params, payload) => {
				const bar = options.barCompleteString?.substring(0, Math.round(params.progress * (options.barsize ?? 40))) ?? "";
				const emptyBar = options.barIncompleteString?.substring(0, (options.barsize ?? 40) - bar.length) ?? "";
				const pct = Math.round(params.progress * 100);
				const filename = (payload.filename || "").substring(0, FILENAME_WIDTH).padEnd(FILENAME_WIDTH);
				return ` ${bar}${emptyBar} ${pct}% | ETA: ${params.eta}s | ${filename} | ${params.value}/${params.total}`;
			},
		},
		cliProgress.Presets.shades_classic,
	);
}
