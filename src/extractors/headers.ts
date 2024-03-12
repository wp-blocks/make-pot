import type { Args } from '../types'
import { extractPhpPluginData } from './php'

// Todo maybe i have already written this
import packageJson from '../../package.json'
import { extractCssThemeData } from './css'

/**
 * Generates a POT header for a given set of arguments.
 * https://developer.wordpress.org/cli/commands/i18n/make-pot/ ->
 * String that should be added as a comment to the top of the resulting POT file.
 * By default, a copyright comment is added for WordPress plugins and themes in the following manner:
 * `
 * Copyright (C) 2018 Example Plugin Author
 * This file is distributed under the same license as the Example Plugin package.
 * `
 * If a plugin or theme specifies a license in their main plugin file or stylesheet,
 * the comment looks like this: Copyright (C) 2018 Example Plugin Author This file is distributed under the GPLv2.
 *
 * @param {Args} args - The arguments object containing the headers and their values.
 * @return {string} The generated POT header.
 */
export function generateHeaderComments(args: Args): string {
	/** @type {Record<string, string>} */
	const headerData = {
		...args.headers,
		author: args.headers?.author || 'AUTHOR',
		slug: args.headers?.slug || 'PLUGIN NAME',
		email: args.headers?.email || 'EMAIL',
		license: args.headers?.license || 'gpl-2.0 or later',
		version: args.headers?.version || 'VERSION',
		language: args.headers?.language || 'LANGUAGE',
		domain: args.headers?.domain || args.headers?.slug || undefined,
		bugs: {
			url:
				// @ts-ignore
				args.headers?.bugs?.url ||
				'https://wordpress.org/support/plugin/' + args.slug,
			// @ts-ignore
			email: args.headers?.bugs?.email || 'AUTHOR EMAIL',
		},
	} as const

	const header = {
		'': {
			'': {
				msgid: '',
				msgstr: [
					`# Copyright (C) ${new Date().getFullYear()} ${headerData.slug}`,
					`# ${headerData.email}`,
					`msgid ""`,
					`msgstr ""`,
					`"Project-Id-Version: ${headerData.slug} ${headerData.version}\\n"`,
					`"Report-Msgid-Bugs-To: ${headerData.bugs.email}\\n"`,
					`"${headerData.bugs.url}\\n"`,
					`"MIME-Version: 1.0\\n"`,
					`"Content-Type: text/plain; charset=UTF-8\\n"`,
					`"Content-Transfer-Encoding: 8bit\\n"`,
					`"POT-Creation-Date: ${new Date().toISOString()}\\n"`,
					`"PO-Revision-Date: ${new Date().getFullYear()}-MO-DA HO:MI+ZONE\\n"`,
					`"Last-Translator: ${headerData.author} <${headerData.email}>\\n"`,
					`"Language-Team: ${headerData.author} <${headerData.email}>\\n"`,
					`"X-Generator: ${packageJson.name} ${packageJson.version}\\n"`,
					`"Language: ${headerData.language}\\n"`,
					`"Plural-Forms: nplurals=2; plural=(n != 1);\\n"`,
					// add domain if specified
					headerData.domain
						? `"X-Domain: ${headerData.domain}\\n"`
						: '',
				],
			},
		},
	}
}

/**
 * Extracts main file data based on the given arguments.
 *
 * @param {Args} args - The arguments for extracting the main file data.
 * @return {Record<string, string>} The extracted main file data.
 */
export function extractMainFileData(args: Args): Record<string, string> {
	if (['plugin', 'block', 'generic'].includes(args.domain)) {
		return extractPhpPluginData(args)
	} else if (['theme', 'theme-block'].includes(args.domain)) {
		return extractCssThemeData(args)
	}

	console.log('No main file detected.')
	return {}
}
