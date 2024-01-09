import { type Args, type Patterns, type TranslationString } from './types'
import { extractMainFileData, extractPackageData } from './extractors'
import { extractTranslationsFromCode } from './parser'

import fs from 'fs/promises'
import { glob } from 'glob'
import path from 'path'
import { existsSync } from 'node:fs'
import { DEFAULT_EXCLUDED_PATH } from './const'
import { writePotFile } from './fs'
import { consolidateTranslations } from './consolidate'

function parseArgs (opts: Record<string, string>): Args {
  if (opts === null || opts === undefined) {
    opts = {}
  }
  const args = opts as Partial<Args>
  return {
    // Paths
    sourceDirectory: args.sourceDirectory ?? process.cwd(),
    destination: args.destination ?? process.cwd(),
    slug: args.slug ?? path.basename(process.cwd()),
    domain: args.domain ?? 'generic',
    ignoreDomain: args.ignoreDomain ?? false,
    headers: args.headers,
    location: args.location ?? false,
    // Patterns
    mergePaths: (args.mergePaths as unknown as string)?.split(',') ?? [],
    subtractPaths: (args.subtractPaths as unknown as string)?.split(',') ?? [],
    subtractAndMerge: (args.subtractAndMerge as unknown as string)?.split(',') ?? [],
    includePaths: (args.includePaths as unknown as string)?.split(',') ?? ['*'],
    excludePaths: (args.excludePaths as unknown as string)?.split(',') ?? DEFAULT_EXCLUDED_PATH,
    // Config: skip, comment and package name
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
  const startTime = new Date()
  // parse command line arguments
  const args = parseArgs(argv)
  // get metadata from the main file (theme and plugin)
  const metadata = extractMainFileData(args)
  // get package data
  const pkgData = extractPackageData(args)

  const newArgs: Args = { ...pkgData, ...metadata, ...args }
  console.log('📝 Making a pot file...')
  console.log('🔍 Extracting strings...', newArgs.slug)

  extractStrings(newArgs)
    .then(async (translations) => {
      if (translations.length > 0) {
        await writePotFile(args, translations)
      }
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      console.log('🎉 Done in ', new Date().getTime() - startTime.getTime(), 'ms.')
    })
}

export async function getStrings (sourceDirectory: string, pattern: Patterns): Promise<TranslationString[]> {
  const included = '{' + pattern.included.join(',') + '}'
  const excluded = '{' + pattern.excluded.join(',') + '}'

  try {
    const files = await glob(included, { ignore: excluded, nodir: true, cwd: sourceDirectory })

    console.log('Files:', files, included)

    const translationPromises: Array<Promise<TranslationString[]>> = files
      .map(async (file: string) => {
        if (existsSync(file)) {
          const content = await fs.readFile(file, { encoding: 'utf8' })
          return extractTranslationsFromCode(content, file)
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

export async function extractStrings (args: Args): Promise<string> {
  const pattern: Patterns = {
    included: args.includePaths ?? [],
    excluded: args.excludePaths ?? [],
    mergePaths: args.mergePaths ?? [],
    subtractPaths: args.subtractPaths ?? [],
    subtractAndMerge: args.subtractAndMerge ?? []
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
