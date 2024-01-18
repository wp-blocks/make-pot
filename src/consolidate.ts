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
		Object.entries(translations).forEach(([msgctxt, translations]) => {
			Object.entries(translations).forEach(([msgid, translation]) => {
				if (!mergedTranslations[msgctxt]) {
					const mergedTranslation = {
						[msgid]: translation,
					}
					mergedTranslations[msgctxt] = mergedTranslation
				} else {
					mergedTranslations[msgctxt][msgid] = translation
				}
			})
		})
	})

	return mergedTranslations
}
