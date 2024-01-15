import type { Args, Patterns, TranslationString } from './types'
import { glob } from 'glob'
import { getParser, parseFile } from './tree'
import { consolidateTranslations } from './consolidate'
import cliProgress from 'cli-progress'

export async function getFiles (args: Args, pattern: Patterns) {
  const included = '{' + pattern.included.join(',') + '}'
  const excluded = '{' + pattern.excluded.join(',') + '}'
  return await glob(included, { ignore: excluded, nodir: true, cwd: args.sourceDirectory ?? process.cwd() })
}

export async function getStrings (args: Args, pattern: Patterns) {
  const files = await getFiles(args, pattern)

  // Set up the progress bar
  const progressBar = new cliProgress.SingleBar({
    clearOnComplete: true,
    etaBuffer: 1000,
    hideCursor: true,
    format: ' {bar} {percentage}% | ETA: {eta}s | {filename} | {value}/{total}',
  }, cliProgress.Presets.shades_classic);

  progressBar.start(files.length + 1, 0);

  const tasks: Promise<TranslationString[]>[] = [];
  files.forEach((file, index) => {
    const task = parseFile({ filepath: file, language: getParser(file), stats: { bar: progressBar, index } })
    if (task !== null) tasks.push(task as Promise<TranslationString[]>)
  })

  const results = await Promise.all(tasks)

  progressBar.stop();

  return results
    .flat()
    .filter(t => t != null) ?? []
}

export async function runExtract (args: Args) {
  const pattern: Patterns = {
    included: args.include ?? [],
    excluded: args.exclude ?? [],
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
