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

  for (const translation of translationStrings) {
    const tkey = translation.msgid[0]
    groupedTranslations[tkey].push(translation)
  }

  let consolidatedStrings: string = ''

  for (const key in groupedTranslations) {
    const translations = groupedTranslations[key]
    const t = translations[0]

    const translatorComment = t?.comments !== undefined ? `#. translators: ${t.comments}\n` : ''
    const contextComment = t?.msgctxt !== undefined ? `msgctxt "${t.msgctxt}"\n` : ''
    const msgidLine = t?.msgid !== undefined ? `msgid "${t.msgid}"\n` : ''

    const referenceComments = translations.map(translation => translation.reference + '\n').join('')
    const msgstr = 'msgstr ""\n'

    const consolidatedString = `${referenceComments}${translatorComment}${contextComment}${msgidLine}${msgstr}`
    consolidatedStrings += consolidatedString + '\n'
  }

  return consolidatedStrings.trim()
}
