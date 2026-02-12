import type { SetOfBlocks } from "gettext-merger";
import Tannin from "tannin";
import type { Args } from "../types.js";
import type { GetTextTranslation } from 'gettext-parser'

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
): string {
	const jedData = {
		[args.slug]: {
			"": potHeader ?? {},
			...(translationsUnion.toJson() as{
				[key: string]: {
					[key: string]: GetTextTranslation;
				};
			}),
		},
	};
	const i18n = new Tannin(jedData);

	return i18n.toString();
}
