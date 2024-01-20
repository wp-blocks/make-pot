// flatten the results merging results into one array of strings
import type { TranslationStrings } from './types'

/**
 * Consolidates an array of translation strings into a single object.
 *
 * @returns The consolidated translation strings object.
 * @param translationsArray
 */

export function consolidate(
	translationsArray: TranslationStrings[]
): TranslationStrings {
	const mergedTranslations: TranslationStrings = {}

	translationsArray.forEach((translations) => {
		Object.entries(translations).forEach(
			([context, contextTranslations]) => {
				if (!mergedTranslations[context]) {
					mergedTranslations[context] = {}
				}

				Object.entries(contextTranslations).forEach(
					([msgid, translation]) => {
						if (!mergedTranslations[context][msgid]) {
							mergedTranslations[context][msgid] = {
								msgctxt: context !== '' ? context : undefined,
								msgid: msgid ?? '',
								msgid_plural: translation.msgid_plural,
								msgstr: translation.msgstr,
								comments: translation.comments,
							}
						}
					}
				)
			}
		)
	})

	return mergedTranslations
}
