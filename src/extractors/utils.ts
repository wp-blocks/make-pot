import type { Args } from '../types'
import path from 'path'
import fs from 'fs'
import { GetTextTranslation } from 'gettext-parser'
import { pluginHeaders } from '../maps'

/**
 * Returns the key of an object based on its value
 *
 * @param object the object that contains the key
 * @param value the key that we want to get
 * @return {Record<string, string>} the filtered keys
 */
export function getKeyByValue(
	object: Record<string, unknown>,
	value: string
): string {
	return Object.keys(object).find((key) => object[key] === value) ?? value
}

/**
 * Extracts package data from the given arguments and returns a record
 * containing the specified fields from the package.json file.
 *
 * @param {Args} args - The arguments for extracting package data.
 *
 * @return {Record<string, string>} - A record containing the extracted package data.
 */
export function extractPackageJson(args: Args): Record<string, string> {
	const fields = pluginHeaders
	const pkgJsonMeta: Record<string, string> = {}
	// read the package.json file
	const packageJsonPath = args.paths.cwd
		? path.join(args.paths.cwd, 'package.json')
		: 'package.json'

	/**
	 *  check if the package.json extract the fields from the package.json file
	 */
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
		// extract the fields from the package.json file
		for (const field of Object.keys(fields)) {
			if (packageJson[field] !== undefined) {
				pkgJsonMeta[field] = packageJson[field]
			}
		}
	}
	return pkgJsonMeta
}

/**
 * returns a gettext translation object
 *
 * @param label the label of the translation
 * @param string the string of the translation
 * @param filePath the file path of the translation
 */
export const gentranslation = (
	label: string,
	string: string,
	filePath?: string | undefined
): GetTextTranslation => {
	return {
		msgctxt: undefined,
		msgid: string,
		msgid_plural: '',
		msgstr: [],
		comments: {
			extracted: label,
			reference: filePath,
		} as GetTextTranslation['comments'],
	}
}
