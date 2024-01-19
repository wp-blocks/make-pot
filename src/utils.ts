import { type Args, PotHeaders } from './types'

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
	const { author, email, license } = {
		...args.headers,
		author: args.headers?.author ?? 'AUTHOR',
		email: args.headers?.email ?? 'EMAIL',
		license: args.headers?.license ?? 'gpl-2.0 or later',
	}

	return `# Copyright (C) ${new Date().getFullYear()} ${author} (${email})
# This file is distributed under the ${license}.`
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

/**
 * Removes the markup from a comment string.
 *
 * @param {string} comment - The comment string to remove markup from.
 * @return {string} The comment text without the markers.
 */
export function stripTranslationMarkup(comment: string): string {
	// Match anything between the comment start `/**` and end `*/`, including `translators:`
	const commentPattern = /\/\*\*[\s]*translators:[\s]*(.*)[\s]*\*\//
	const matches = comment.match(commentPattern)

	// Return the first capture group, which is the comment text without the markers
	return matches ? matches[1].trim() : ''
}
