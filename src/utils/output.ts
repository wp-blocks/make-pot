import type { SetOfBlocks } from "gettext-merger";
import Tannin from "tannin";
import type { Args } from "../types";

/**
 * Outputs the pot file in json format based on the command line arguments --json option
 *
 * @param {Args} args - The command line arguments
 * @param {Record<string, string>} potHeader - The pot file header
 * @param {SetOfBlocks} translationsUnion - The translations union
 * @return {string} - The output pot file
 */
export function outputJson(
	args: Args,
	potHeader: Record<string, string> | null,
	translationsUnion: SetOfBlocks,
) {
	const jedData: {
		[p: string]: { [p: string]: [string, string] };
	} = {
		[args.slug]: {
			"": potHeader ?? {},
			...(translationsUnion.toJson() as { [p: string]: [string, string] }),
		},
	};
	const i18n = new Tannin(jedData);

	return i18n.toString();
}
