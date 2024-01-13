import type { Args, Patterns, TranslationString } from './types'
import { glob } from 'glob'
import { getParser, parseFile } from './tree'
import { consolidateTranslations } from './consolidate'

export async function getFiles (args: Args, pattern: Patterns) {
  const included = '{' + pattern.included.join(',') + '}'
  const excluded = '{' + pattern.excluded.join(',') + '}'
  return await glob(included, { ignore: excluded, nodir: true, cwd: args.sourceDirectory ?? process.cwd() })
}

export async function getStrings (args: Args, pattern: Patterns) {
  const files = await getFiles(args, pattern)

  const tasks = files.map(async (file) => await parseFile({ filepath: file, language: getParser(file) }) )
  const results = await Promise.all(tasks)

  return results.flat() as TranslationString[] ?? []
}

export async function runExtract (args: Args) {
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
    if (args.skipBlade !== true) {
      // php files but not blade.php
      pattern.included.push('**/*.php')
    } else {
      pattern.included.push('**/*.php', '!**/blade.php')
    }
  }

  // js typescript mjs cjs etc
  if (args.skipJs !== undefined) {
    pattern.included.push('**/*.{js,jsx,ts,tsx,mjs,cjs}')
  }

  if (args.skipBlockJson !== undefined) {
    pattern.included.push('**/block.json')
  }

  if (args.skipThemeJson !== undefined) {
    pattern.included.push('**/theme.json')
  }

  if (args.skipAudit !== undefined) {
    const stringsJson = await getStrings(args, pattern)
    // merge all strings collecting duplicates and returning the result as the default gettext format
    return consolidateTranslations(stringsJson)
  } else {
    return pattern.included.join('\n')
  }
}
