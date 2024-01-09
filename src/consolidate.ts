import type { TranslationString } from './types'

/**
 * Consolidate an array of translation strings into a single i18n file string.
 * The output follows the gettext specifications.
 *
 * @param {TranslationString[]} translationStrings - Array of translation strings.
 * @return {string} Consolidated i18n file string.
 */
export function consolidateTranslations (translationStrings: TranslationString[]): string {
  // Group translations by msgid and msgctxt
  const groupedTranslations: Record<string, TranslationString[]> = {}

  for (const translation of translationStrings) {
    const key = `${translation.msgid}||${translation.msgctxt}`
    if (!groupedTranslations[key]) {
      groupedTranslations[key] = []
    }
    groupedTranslations[key].push(translation)
  }

  // Generate the consolidated i18n file string
  let consolidatedStrings: string = ''

  for (const key in groupedTranslations) {
    const translations = groupedTranslations[key]
    const t = translations[0]

    let translatorComment = ''
    let contextComment = ''
    let referenceComments = ''
    let msgidLine = ''
    let msgstrLine = ''

    if (t?.comments !== undefined) {
      translatorComment = `#. translators: ${t.comments}\n`
    }
    if (t?.msgctxt !== undefined) {
      contextComment = `msgctxt "${t.msgctxt}"\n`
    }
    if (t?.msgid !== undefined) {
      msgidLine = `msgid "${t.msgid}"\n`
    }

    translations.forEach((translation, index) => {
      const reference = `#: reference-${index}` // Replace with actual reference if available
      referenceComments += reference + '\n'
    })

    const consolidatedString = `${referenceComments}${translatorComment}${contextComment}${msgidLine}${msgstrLine}`
    consolidatedStrings += consolidatedString + '\n'
  }

  return consolidatedStrings.trim() // Trim the last newline character
}
