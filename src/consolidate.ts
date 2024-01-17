import type { TranslationString } from './types'

/**
 * Consolidate an array of translation strings into a single i18n file string.
 * The output follows the gettext specifications.
 *
 * @param {TranslationString[]} translationStrings - Array of translation strings.
 * @return {string} Consolidated i18n file string.
 */
export function consolidateTranslations(
	translationStrings: TranslationString[]
): Record<string, TranslationString[]> {
	const groupedTranslations: Record<string, TranslationString[]> = {}

	translationStrings.forEach((translation) => {
		groupedTranslations[translation.msgid] =
			groupedTranslations[translation.msgid] || []
		groupedTranslations[translation.msgid].push(translation)
	})

	return groupedTranslations
}

export function outputTranslationsPot(
	translationStrings: Record<string, TranslationString[]>
): string {
	let consolidatedStrings = ''

	for (const msgid in translationStrings) {
		const translations = translationStrings[msgid]
		const t = translations[0]

		const translatorComment = t.comments
			? `#. translators: ${t.comments}\n`
			: ''
		const contextComment = t.msgctxt ? `msgctxt "${t.msgctxt}"\n` : ''
		const msgidLine = `msgid "${msgid}"\n`
		const referenceComments =
			translations?.map((tr) => tr.reference).join('\n') + '\n'
		const msgstr = 'msgstr ""\n'

		const consolidatedString = `${translatorComment}${referenceComments}${contextComment}${msgidLine}${msgstr}\n`
		consolidatedStrings += consolidatedString
	}

	return consolidatedStrings
}
