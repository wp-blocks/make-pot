import { unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Block, SetOfBlocks } from "gettext-merger";
import type { Args } from "../types.js";

export function audit(args: Args, translationsUnion: SetOfBlocks) {
	/** Run the audit process */
	const auditor = new StringAuditor(args.domain);
	auditor.auditStrings(translationsUnion.blocks);

	/** Get and print the results of the audit process */
	console.log("\nAudit Complete!");
	if (auditor.getResults().length === 0) {
		console.log("No issues found! 🎉");
		//if there are no errors, we can remove the audit.log file
		try {
			unlinkSync(path.join(args.paths.cwd, "audit.log"));
		} catch (_error) {
			//ignore
		}
	} else {
		console.log(`Found ${auditor.getResults().length} issues!`);
		const results = auditor.getResults().join("\n");
		console.log(results);
		/** Write the audit results to a file */
		writeFileSync(path.join(args.paths.cwd, "audit.log"), results);
	}
}

/**
 * Class to audit gettext strings
 *
 * Example usage:
 * const auditor = new StringAuditor('plugin');
 * auditor.auditStrings(translationBlocks);
 */
class StringAuditor {
	private readonly SPRINTF_PLACEHOLDER_REGEX =
		/%(?:\d+\$)?[+-]?(?:[ 0]|'.)?-?\d*(?:\.\d+)?[bcdeEfFgGhHosuxX]/g;
	private readonly UNORDERED_SPRINTF_PLACEHOLDER_REGEX =
		/%(?!(\d+)\$)[+-]?(?:[ 0]|'.)?-?\d*(?:\.\d+)?[bcdeEfFgGhHosuxX]/g;
	private projectType: string;

	/**
	 * The results of the audit process
	 */
	public results: string[] = [];

	constructor(projectType: string) {
		this.projectType = projectType;
	}

	private getFileHeaders(projectType: string): string[] {
		// Implement based on your requirements
		// This would be the equivalent of the PHP get_file_headers method
		const headers: Record<string, string[]> = {
			plugin: [
				"Plugin Name:",
				"Plugin URI:",
				"Description:",
				"Author:",
				"Author URI:",
				"Version:",
				"Text Domain:",
				"Domain Path:",
				"Network:",
				"Requires at least:",
				"Requires PHP:",
			],
			theme: [
				"Theme Name:",
				"Theme URI:",
				"Author:",
				"Author URI:",
				"Description:",
				"Version:",
				"License:",
				"License URI:",
				"Text Domain:",
				"Domain Path:",
				"Tags:",
				"Requires at least:",
				"Requires PHP:",
			],
		};

		return headers[projectType] || [];
	}

	auditStrings(translations: Block[]): void {
		for (const translation of translations) {
			const references = translation.comments?.reference || [];

			// File headers don't have any file references
			const location = references.length > 0 ? `(${references[0]})` : "";

			// Check 0: Flag strings without msgid is the header so it's not a translation and should be ignored
			if (!translation.msgid) {
				continue;
			}

			// Check 1: Flag strings with placeholders that should have translator comments
			if (
				(!translation.comments?.extracted ||
					translation.comments.extracted.length === 0) &&
				(translation.msgid.match(this.SPRINTF_PLACEHOLDER_REGEX) || [])
					.length >= 1
			) {
				const message = `The string "${translation.msgid}" contains placeholders but has no "translators:" comment to clarify their meaning. ${location}`;
				this.results.push(message);
			}

			// Check 2: Flag strings with different translator comments
			if (
				translation.comments?.extracted &&
				translation.comments.extracted.length > 0
			) {
				let comments = translation.comments.extracted;

				// Remove plugin header information from comments
				comments = comments.filter((comment) => {
					for (const fileHeader of this.getFileHeaders(this.projectType)) {
						if (comment.startsWith(fileHeader)) {
							return false;
						}
					}
					return true;
				});

				const uniqueComments: string[] = [];

				// Remove duplicate comments
				comments = comments.filter((comment) => {
					if (uniqueComments.includes(comment)) {
						return false;
					}
					uniqueComments.push(comment);
					return true;
				});

				const commentsCount = comments.length;

				if (commentsCount > 1) {
					const message = `The string "${translation.msgid}" has ${commentsCount} different translator comments. ${location}\n${comments.join("\n")}`;
					this.results.push(message);
				}
			}

			// Extract non-placeholder content from the string
			const nonPlaceholderContent = translation.msgid
				.trim()
				.replace(/^(['"])(.*)\1$/s, "$2")
				.replace(this.SPRINTF_PLACEHOLDER_REGEX, "");

			// Check 3: Flag empty strings without any translatable content
			if (nonPlaceholderContent === "") {
				const message = `Found string without translatable content. ${location}`;
				this.results.push(message);
			}

			// Check 4: Flag strings with multiple unordered placeholders (%s %s %s vs. %1$s %2$s %3$s)
			const unorderedMatches =
				translation.msgid.match(this.UNORDERED_SPRINTF_PLACEHOLDER_REGEX) || [];
			const unorderedMatchesCount = unorderedMatches.length;

			if (unorderedMatchesCount >= 2) {
				const message = `Multiple placeholders should be ordered. ${location}`;
				this.results.push(message);
			}

			if (translation.msgid_plural) {
				const singlePlaceholders =
					translation.msgid.match(this.SPRINTF_PLACEHOLDER_REGEX) || [];
				const pluralPlaceholders =
					translation.msgid_plural.match(this.SPRINTF_PLACEHOLDER_REGEX) || [];

				// See https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#plurals
				if (singlePlaceholders.length < pluralPlaceholders.length) {
					// Check 5: Flag things like _n('One comment', '%s Comments')
					const message = `Missing singular placeholder, needed for some languages. See https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#plurals ${location}`;
					this.results.push(message);
				} else {
					// Reordering is fine, but mismatched placeholders is probably wrong
					const sortedSinglePlaceholders = [...singlePlaceholders].sort();
					const sortedPluralPlaceholders = [...pluralPlaceholders].sort();

					// Check 6: Flag things like _n('%s Comment (%d)', '%s Comments (%s)')
					if (
						JSON.stringify(sortedSinglePlaceholders) !==
						JSON.stringify(sortedPluralPlaceholders)
					) {
						const message = `Mismatched placeholders for singular and plural string. ${location}`;
						this.results.push(message);
					}
				}
			}
		}
	}

	/**
	 * Get the results of the audit process
	 * @returns An array of messages
	 */
	public getResults(): string[] {
		return this.results;
	}
}

export default StringAuditor;
