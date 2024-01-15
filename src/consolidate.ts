import type { TranslationString } from './types'

/**
 * Consolidate an array of translation strings into a single i18n file string.
 * The output follows the gettext specifications.
 *
 * @param {TranslationString[]} translationStrings - Array of translation strings.
 * @return {string} Consolidated i18n file string.
 */
export function consolidateTranslations (translationStrings: TranslationString[]): string {
  const groupedTranslations: Record<string, TranslationString[]> = {}

  console.log(translationStrings)

  // Initialize groupedTranslations object with an empty array for each unique msgid
  translationStrings.forEach(translation => {
    if (!groupedTranslations[translation?.msgid]) {
      groupedTranslations[translation.msgid] = []
    }
    groupedTranslations[translation.msgid].push(translation)
  })

  let consolidatedStrings = ''

  // Iterate over each group and construct the consolidated string
  for (const msgid in groupedTranslations) {
    const translations = groupedTranslations[msgid]
    const t = translations[0] // Representative translation for common properties

    const translatorComment = t.comments ? `#. translators: ${t.comments}\n` : ''
    const contextComment = t.msgctxt ? `msgctxt "${t.msgctxt}"\n` : ''
    const msgidLine = `msgid "${msgid}"\n`

    const referenceComments = translations.map(tr => `${tr.reference}`).join('\n')
    const msgstr = 'msgstr ""\n'

    const consolidatedString = `${translatorComment}${referenceComments}\n${contextComment}${msgidLine}${msgstr}\n`
    consolidatedStrings += consolidatedString
  }

  return consolidatedStrings.trim() // Trim the last newline character
}
