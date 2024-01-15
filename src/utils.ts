import { type Args, PotHeaders } from './types'

/**
 * Generates a POT header for a given set of arguments.
 *
 * @param {Args} args - The arguments object containing the headers and their values.
 * @return {string} The generated POT header.
 */
export function generatePotHeader(args: Args): string {
	const { author, email, bugs, license, packageName, version } = {
		...args.headers,
		author: args.headers?.author ?? 'AUTHOR',
		email: args.headers?.email ?? 'EMAIL',
		bugs: args.headers?.bugs ?? '',
		license: args.headers?.license ?? 'gpl-2.0 or later',
		packageName: args.headers?.packageName ?? 'NO PACKAGE NAME DEFINED',
		version: args.headers?.version ?? '1.0',
	}

	return `# Copyright (C) ${new Date().getFullYear()} ${author} (${email})
# This file is distributed under the ${license}.
msgid ""
msgstr ""
"Project-Id-Version: ${packageName} ${version}\\n"
"Report-Msgid-Bugs-To: ${bugs}\\n"
"Last-Translator: ${author} ${email}\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"POT-Creation-Date: ${new Date().toISOString()}\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"X-Generator: ${packageName}\\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\\n"


`
}

/**
 * A function that removes comment markup from a given string.
 *
 * @param {string} input - The input string with comment markup.
 * @return {string} - The input string without comment markup.
 */
export function getCommentBlock(input: string): string {
	const commentBlock = input.match(/\/\*\*?[\s\S]*?\*\//)
	return commentBlock !== null ? commentBlock[0] : input
}

/**
 * A function that removes comment markup from a given string.
 *
 * @param {string} input - The input string with comment markup.
 * @return {string} - The input string without comment markup.
 */
export function removeCommentMarkup(input: string): string {
	return input.replace(/\/\*[\s\S]*?\*\/|\/\/.*/gm, '')
}
