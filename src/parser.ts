import { prefixes } from './const'
import { type TranslationString } from './types'

/**
 * Parse a POT file content and extract translations with associated data.
 *
 * @param {string} content - Content of the POT file.
 * @returns {Object} - Object containing extracted translations with data.
 */
export function extractTranslations (content: string) {
  const translations: Array<{ msgid: string, msgstr: string, msgctxt: string, comments: string, translationKey: string | null }> = []

  // Split content into individual translation entries
  const entries = content.split('\n\n')

  entries.forEach(entry => {
    let msgid = ''
    let msgstr = ''
    let msgctxt = ''
    let comments = ''

    // Extract msgid, msgstr, and other information
    const lines = entry.split('\n')
    lines.forEach(line => {
      if (line.startsWith('msgid')) {
        msgid = line.slice(6).trim()
      } else if (line.startsWith('msgstr')) {
        msgstr = line.slice(7).trim()
      } else if (line.startsWith('msgctxt')) {
        msgctxt = line.slice(8).trim()
      } else if (line.startsWith('#')) {
        comments += line.slice(2).trim() + '\n'
      }
    })

    // Check if the msgid starts with one of the specified prefixes
    for (const prefix in prefixes) {
      if (msgid.startsWith(prefix)) {
        // Extract a translation key
        const translationKey = prefixes[prefix as keyof typeof prefixes][0]

        // Create an object representing the translation with associated data
        const translationData = {
          msgid,
          msgstr,
          msgctxt,
          comments
        }

        // Add the translation to the translation array
        translations.push({ translationKey, ...translationData })
      }
    }
  })

  return translations
}

/**
 * Parse a PHP or JS file content and extract translations with associated data.
 *
 * @param {string} content - Content of the PHP or JS file.
 * @returns {Object} - Object containing extracted translations with data.
 */
export function extractTranslationsFromCode (content: string): TranslationString[] {
  const translations: TranslationString[] = []

  // Regular expression to match translator comments and translation functions in code
  const regex = /(?:\/\*\s*translators:(.*?)\*\/\s*)?(?:__|_e|_n|_x|_nx)\(\s*(['"])(.*?)\2(?:\s*,\s*(['"])(.*?)\4)?\s*\)/g

  let match
  while ((match = regex.exec(content)) !== null) {
    const [fullMatch, translatorComment = '', , msgid, , msgctxt] = match

    // Determine a translation key based on the function used
    const translationFunction = fullMatch.split('(')[0].trim()
    const translationKey = prefixes[translationFunction as keyof typeof prefixes] ? prefixes[translationFunction as keyof typeof prefixes][0] : '__'

    translations.push({
      fn: translationKey ?? '__',
      msgid,
      msgstr: undefined,
      msgctxt,
      comments: translatorComment.trim()
    })
  }

  return translations
}
