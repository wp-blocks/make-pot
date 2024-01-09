import { type Args, type Patterns, type TranslationString } from './types'
import { extractMainFileData, extractPackageData } from './extractors'
import { extractTranslationsFromCode } from './parser'
import { generatePotHeader } from './utils'

import fs from 'fs/promises'
import { glob } from 'glob'
import path from 'path'
import { existsSync } from 'node:fs'

const SPRINTF_PLACEHOLDER_REGEX = /(?:[^%]|^)(%[+-]?(?:0|'.)?-?[0-9]*(?:\.[0-9]+)?[bcdeEfFgGosuxX])/

const UNORDERED_SPRINTF_PLACEHOLDER_REGEX = /(?:[^%]|^)(%[+-]?(?:0|'.)?-?[0-9]*(?:\.\d+)?[bcdeEfFgGosuxX])/

function parseArgs (opts: Record<string, string>): Args {
  if (opts === null || opts === undefined) {
    opts = {}
  }
  const args = opts as Partial<Args>
  return {
    sourceDirectory: args.sourceDirectory ?? process.cwd(),
    destination: args.destination ?? process.cwd(),
    slug: args.slug ?? path.basename(process.cwd()),
    domain: args.domain ?? 'generic',
    ignoreDomain: args.ignoreDomain ?? false,
    mergePaths: (args.mergePaths as unknown as string)?.split(',') ?? [],
    subtractPaths: (args.subtractPaths as unknown as string)?.split(',') ?? [],
    subtractAndMerge: (args.subtractAndMerge as unknown as string)?.split(',') ?? [],
    includePaths: (args.includePaths as unknown as string)?.split(',') ?? [],
    excludePaths: (args.excludePaths as unknown as string)?.split(',') ?? ['node_modules', 'vendor', 'Gruntfile.js', 'webpack.config.js', '*.min.js', 'ts.config.js', 'test', 'tests'],
    headers: args.headers ?? [],
    location: args.location ?? false,
    skipJs: args.skipJs ?? false,
    skipPhp: args.skipPhp ?? false,
    skipBlade: args.skipBlade ?? false,
    skipBlockJson: args.skipBlockJson ?? false,
    skipThemeJson: args.skipThemeJson ?? false,
    skipAudit: args.skipAudit ?? false,
    fileComment: args.fileComment ?? '',
    packageName: args.packageName ?? ''
  } satisfies Args
}

export function makePot (argv: Record<string, string>): void {
  // parse command line arguments
  const args = parseArgs(argv)
  // get metadata from the main file (theme and plugin)
  const metadata = extractMainFileData(args)
  // get package data
  const pkgData = extractPackageData(args)

  const newArgs: Args = { ...pkgData, ...metadata, ...args }
  console.log('📝 Making a pot file...')
  console.log('🔍 Extracting strings...', newArgs.slug)
  console.log(newArgs)

  extractStrings(newArgs)
    .then(async (translations) => {
      if (translations.length > 0) {
        await writePotFile(args, translations)
      }
    }).then(() => {
      console.log('🎉 Done.')
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      console.log('🎉 Done.')
    })
}

export async function writePotFile (args: Args, fileContent: string): Promise<void> {
  // the path to the .pot file
  const potFilePath = path.join(args.destination, `${args.slug}.pot`)

  await fs.writeFile(potFilePath, generatePotHeader(args) + fileContent)
}

export async function getStrings (sourceDirectory: string, pattern: Patterns): Promise<TranslationString[]> {
  const included = '{' + pattern.included.join(',') + '}'
  const excluded = '{' + pattern.excluded.join(',') + '}'

  try {
    const files = await glob(included, { ignore: excluded })

    console.log('Files:', files, included)

    const translationPromises: Array<Promise<TranslationString[]>> = files.map(async (file: string) => {
      if (existsSync(file)) {
        const content = await fs.readFile(file, { encoding: 'utf8' })
        return extractTranslationsFromCode(content)
      }
      console.error('File not found:', file)
      return []
    })

    const translationsArray = await Promise.all(translationPromises)
    return translationsArray.flat() // Flatten the array of arrays to a single array
  } catch (error) {
    console.error(error)
    return []
  }
}

/**
 * Consolidate an array of translation strings into a single i18n file string.
 * The output follows the gettext specifications.
 *
 * @param {TranslationString[]} translationStrings - Array of translation strings.
 * @return {string} Consolidated i18n file string.
 */
export function consolidateTranslations (translationStrings: TranslationString[]): string {
  // Group translations by msgid and msgctxt
  let groupedTranslations: Record<string, TranslationString[]> = {}

  for (const translation of translationStrings) {
    const key = `${translation.msgid}||${translation.msgctxt}`
    groupedTranslations = { ...groupedTranslations, [key]: translation } as Record<string, TranslationString[]>
  }

  // Generate the consolidated i18n file string
  const consolidatedStrings: string[] = []

  for (const key in groupedTranslations) {
    const translations = groupedTranslations[key]
    const firstTranslation = translations[0]

    // Generate the translator comment
    let translatorComment = ''
    if (firstTranslation?.comments !== undefined) {
      translatorComment = `#. translators: ${firstTranslation.comments}\n`
    }

    // Generate the context comment
    let contextComment = ''
    if (firstTranslation?.msgctxt !== undefined) {
      contextComment = `#. translators: ${firstTranslation.msgctxt}\n`
    }

    // Generate the reference comments
    const referenceComments = Object.entries(translations).map((translation) => {
      return `#: ${translation[1]}\n`
    }).join('')

    // Generate the msgid line

    const msgidLine = (firstTranslation?.msgid !== undefined) ? `msgid "${firstTranslation.msgid}"\n` : ''

    // Generate the msgstr line if available
    let msgstrLine = ''
    if (firstTranslation?.msgstr !== undefined) {
      msgstrLine = `msgstr "${firstTranslation.msgstr}"\n`
    }

    // Combine all parts for this translation
    const consolidatedString = `${translatorComment}${contextComment}${referenceComments}${msgidLine}${msgstrLine}`
    consolidatedStrings.push(consolidatedString)
  }

  // Join all consolidated strings
  return consolidatedStrings.join('\n')
}

export async function extractStrings (args: Args): Promise<string> {
  const pattern: Patterns = {
    included: args.includePaths !== undefined ? args.includePaths.map((p) => path.join(args.sourceDirectory, p)) : [],
    excluded: args.excludePaths !== undefined ? args.excludePaths.map((p) => path.join(args.sourceDirectory, p)) : [],
    mergePaths: args.mergePaths !== undefined ? args.mergePaths.map((p) => path.join(args.sourceDirectory, p)) : [],
    subtractPaths: args.subtractPaths !== undefined ? args.subtractPaths.map((p) => path.join(args.sourceDirectory, p)) : [],
    subtractAndMerge: args.subtractAndMerge !== undefined ? args.subtractAndMerge.map((p) => path.join(args.sourceDirectory, p)) : []
  }

  // Additional logic to handle different file types and formats
  // Exclude blade.php files if --skip-blade is set
  if (args.skipPhp !== true || args.skipBlade !== true) {
    if (args.skipBlade === true) {
      // php files but not blade.php
      pattern.included.push('**/*.php')
    } else {
      pattern.included.push('**/*.php', '!**/blade.php')
    }
  }

  // js typescript mjs cjs etc
  if (args.skipJs !== undefined) {
    pattern.included.push('**/*.{js,jsx,ts,tsx,mjs,cjs,map}')
  }

  if (args.skipBlockJson !== undefined) {
    pattern.included.push('**/block.json')
  }

  if (args.skipThemeJson !== undefined) {
    pattern.included.push('**/theme.json')
  }

  if (args.skipAudit !== undefined) {
    console.log(pattern)

    return await getStrings(args.sourceDirectory, pattern)
      .then((strings) => {
        console.log(`Extracted ${strings.length} strings.`, strings)
        // merge all strings collecting duplicates and returning the result as the default gettext format
        return consolidateTranslations(strings)
      })
      .catch(err => {
        console.log(err)
      }) ?? ''
  } else {
    return pattern.included.join('\n')
  }
}
