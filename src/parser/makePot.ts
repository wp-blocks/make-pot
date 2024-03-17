import { type Args } from '../types'
import { extractMainFileData } from '../extractors/headers'
import { writeFile } from '../fs'
import path from 'path'
import { extractPackageJson } from '../extractors/json'
import { exec } from './exec'

/**
 * Generates a pot file for localization.
 *
 * @param args - the command line arguments
 * @return {Promise<void>} - a promise that resolves when the pot file is generated
 */
export async function makePot(args: Args): Promise<string> {
	/** collect metadata from the get package json */
	const pkgData = extractPackageJson(args)

	/** get metadata from the main file (theme and plugin) */
	const metadata = extractMainFileData(args)

	/** Merge the metadata to get a single object with all the headers */
	args.headers = {
		...args.headers,
		...pkgData,
		...metadata,
	} as Args['headers']

	/** generate the pot file */
	const jsonTranslations = await exec(args)

	const outputPath = path.join(
		process.cwd(),
		(args.headers?.domainPath as string) ?? args.paths.out ?? 'languages',
		`${args?.slug}.${args.options?.json ? 'json' : 'pot'}`
	)

	console.log(`Writing pot file to ${outputPath}`)

	writeFile(jsonTranslations, outputPath)

	return jsonTranslations
}
