import { Args, PotHeaders } from '../types'
import { extractPhpPluginData } from './php'
import { extractCssThemeData } from './css'
import { gentranslation } from './utils'
import { pkgJson } from '../const'
import { SetOfBlocks } from 'gettext-merger'

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
export function generateHeader(args: Args): Record<PotHeaders, string> {
	/** @type {Record<string, string>} */
	const headerData = {
		...args.headers,
		author: args.headers?.author || 'AUTHOR',
		slug: args.slug || 'PLUGIN NAME',
		email: args.headers?.email || 'EMAIL',
		license: args.headers?.license || 'gpl-2.0 or later',
		version: args.headers?.version || '1.0.0',
		language: args.headers?.language || 'en',
		domain: args.headers?.textDomain || args.headers?.slug || undefined,
		bugs: {
			url:
				args.headers?.bugsUrl ||
				'https://wordpress.org/support/plugin/' + args.slug,
			email:
				args.headers?.bugsEmail ||
				args.headers?.authoremail ||
				'AUTHOR EMAIL',
		},
	} as const
	const authorString = `${headerData.author} <${headerData.email}>`
	const domain = headerData.domain ? `X-Domain: ${headerData.domain}` : ''

	return {
		'Project-Id-Version': `${headerData.slug} ${headerData.version}`,
		'Report-Msgid-Bugs-To': authorString,
		'MIME-Version': `1.0`,
		'Content-Transfer-Encoding': `8bit`,
		'content-type': 'text/plain; charset=iso-8859-1',
		'plural-forms': 'nplurals=2; plural=(n!=1);',
		'POT-Creation-Date': `${new Date().toISOString()}`,
		'PO-Revision-Date': `${new Date().getFullYear()}-MO-DA HO:MI+ZONE`,
		'Last-Translator': authorString,
		'Language-Team': authorString,
		'X-Generator': `${pkgJson.name} ${pkgJson.version}`,
		Language: `${headerData.language}`,
		// add domain if specified
		domain,
	}
}

/**
 * Extracts main file data based on the given arguments.
 *
 * @param {Args} args - The arguments for extracting the main file data.
 * @return {Record<string, string>} The extracted main file data.
 */
export function extractMainFileData(args: Args): Record<string, string> {
	let extractedData = {}
	if (['plugin', 'block', 'generic'].includes(args.domain)) {
		extractedData = extractPhpPluginData(args)
	} else if (['theme', 'theme-block'].includes(args.domain)) {
		extractedData = extractCssThemeData(args)
	} else {
		console.log('No main file detected.')
	}

	return extractedData
}

/**
 * Generate translation strings based on the given type and headers.
 *
 * @return {Record<string, string>} the generated translation strings
 * @param args
 */
export function translationsHeaders(args: Args): SetOfBlocks {
	const { domain, headers } = args as Args
	const { name, description, author, authorUri, url } = headers as {
		name: string
		description: string
		author: string
		authorUri: string
		url: string
	}

	// the main file is the plugin main php file or the css file
	const fakePath = domain === 'plugin' ? args.slug + '.php' : 'style.css'

	return new SetOfBlocks([
		gentranslation(`Name of the ${domain}`, name, fakePath),
		gentranslation(`Url of the ${domain}`, url, fakePath),
		gentranslation(`Description of the ${domain}`, description, fakePath),
		gentranslation(`Author of the ${domain}`, author, fakePath),
		gentranslation(`Author URI of the ${domain}`, authorUri, fakePath),
	])
}
