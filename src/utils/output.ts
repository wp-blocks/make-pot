import type { SetOfBlocks } from "gettext-merger";
import type { Args, JedData, MakeJson } from "../types.js";
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
	const domain = args.slug;
	const gettextTranslations = translationsUnion.toJson() as {
		[key: string]: {
			[key: string]: GetTextTranslation;
		};
	};

	const jedData: JedData = {
		[domain]: {
			"": {
				domain,
				lang: potHeader?.Language || "en",
				plural_forms:
					potHeader?.["Plural-Forms"] || "nplurals=2; plural=(n != 1);",
				...potHeader,
			},
		},
	};

	// Process all translations
	for (const msgctxt of Object.keys(gettextTranslations)) {
		const contextTranslations = gettextTranslations[msgctxt];

		for (const msgid of Object.keys(contextTranslations)) {
			const translation = contextTranslations[msgid];

			// Skip empty msgid (header) as we've already handled it
			if (msgid === "") continue;

			// Construct the key using context if available
			const key =
				msgctxt && msgctxt !== "" ? `${msgctxt}\u0004${msgid}` : msgid;

			// Add the translation to the Jed data structure
			jedData[domain][key] = translation.msgstr;
		}
	}

	const makeJson: MakeJson = {
		domain,
		"translation-revision-date": new Date().toISOString(),
		generator: "makePot",
		source: "",
		locale_data: jedData,
	};

	return JSON.stringify(makeJson, null, 2);
}
