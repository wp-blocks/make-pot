import { type Args } from './types'
import { extractMainFileData, extractPackageData } from './extractors'
import path from 'path'
import { DEFAULT_EXCLUDED_PATH } from './const'
import { writePotFile } from './fs'
import { runExtract } from './parser'

function parseArgs (opts: Record<string, string>): Args {
  if (opts === null || opts === undefined) {
    opts = {}
  }
  const args = opts as Partial<Args>
  return {
    // Paths
    sourceDirectory: args.sourceDirectory ?? undefined,
    destination: args.destination ?? undefined,
    slug: args.slug ?? path.basename(process.cwd()),
    domain: args.domain ?? 'generic',
    ignoreDomain: args.ignoreDomain ?? false,
    headers: undefined,
    location: args.location ?? false,
    // Patterns
    mergePaths: (args.mergePaths as unknown as string)?.split(',') ?? [],
    subtractPaths: (args.subtractPaths as unknown as string)?.split(',') ?? [],
    subtractAndMerge: (args.subtractAndMerge as unknown as string)?.split(',') ?? [],
    include: (args.include as unknown as string)?.split(',') ?? ['*'],
    exclude: (args.exclude as unknown as string)?.split(',') ?? DEFAULT_EXCLUDED_PATH,
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

export async function makePot (argv: Record<string, string>) {
  // parse command line arguments
  let args = parseArgs(argv)
  // get metadata from the main file (theme and plugin)
  const metadata = extractMainFileData(args)
  // get package data
  const pkgData = extractPackageData(args)

  const headers = { ...pkgData, ...metadata, ...args.headers }

  args = { ...args, headers } as Args
  console.log('📝 Making a pot file...')
  console.log('🔍 Extracting strings...', args.slug, args)

  const translations = await runExtract(args)

  await writePotFile(args, translations)
}
