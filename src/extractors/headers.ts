import path from "node:path";
import { debug } from "node:util";
import { SetOfBlocks } from "gettext-merger";
import { boolean } from "yargs";
import type PackageI18n from "../assets/package-i18n.js";
import { modulePath } from "../const.js";
import { getEncodingCharset } from "../fs/fs.js";
import type { Args, I18nHeaders, PotHeaders } from "../types.js";
import { getPkgJsonData } from "../utils/common.js";
import { buildBlock } from "../utils/extractors.js";
import { extractCssThemeData } from "./css.js";
import { extractPhpPluginData } from "./php.js";

/**
 * Checks if required fields are missing and logs a clear error message
 * @param {object} headerData - The header data to validate
 * @param {boolean} debug - Debug mode flag
 * @returns {boolean} - true if all required fields are present, false otherwise
 */
function validateRequiredFields(
	headerData: I18nHeaders,
	debug: boolean,
): boolean {
	const requiredFields = [
		{ key: "slug", name: "Plugin/Theme slug", placeholder: "PLUGIN NAME" },
		{ key: "author", name: "Author name", placeholder: "AUTHOR" },
		{ key: "version", name: "Version", placeholder: "" },
		{ key: "email", name: "Author email", placeholder: "AUTHOR EMAIL" },
		{ key: "xDomain", name: "Text domain", placeholder: "PLUGIN TEXTDOMAIN" },
	];

	const missingFields = requiredFields.filter(
		(field) =>
			!headerData[field.key] ||
			headerData[field.key] === field.placeholder ||
			(field.key === "version" && headerData[field.key] === "0.0.1"),
	);

	if (missingFields.length > 0) {
		console.error("\n!  Missing required information for POT file header:\n");

		for (const field of missingFields) {
			console.error(
				`   - ${field.name} is missing or has a default value (eg. version: 0.0.1")`,
			);
		}

		console.error(
			"\nPlease provide this information adding the missing fields inside the headers object of the plugin/theme declaration or to the package.json file.",
			"\nFor more information check the documentation at https://github.com/wp-blocks/makePot",
		);

		if (missingFields.some((field) => field.key === "email")) {
			console.error(
				"\n\nWordpress didn't require an email field in the headers object but it's required in order to generate a valid pot file.",
				'\nPlease add the email field to the package.json file (author field eg. author: "AUTHOR <EMAIL>")',
				'\nor inject those information using the --headers flag to the "makePot" command (eg. --headers=email:erik@ck.it).',
				"\nFor more information check the documentation at https://github.com/wp-blocks/makePot",
			);
		}

		if (missingFields && debug) {
			console.error(
				"\nDebug information:",
				"\nMissing fields:",
				missingFields,
				"\nHeader data:",
				headerData,
			);
		}

		console.error("\n");

		return false;
	}

	return true;
}

/**
 * Extract author data from package.json author field and return an array of strings
 * the original field is a string and it's longer form is "Your Name <email@example.com> (https://example.com)"
 *
 * @returns an object with name, email, and website
 * @param authorData
 */
function extractAuthorData(authorData: string | object): {
	name: string;
	email?: string;
	website?: string;
} {
	// Default result with placeholder values
	const defaultResult = { name: "AUTHOR", email: "AUTHOR EMAIL" };

	// Return default if no author data
	if (!authorData) {
		return defaultResult;
	}

	// Handle string format: "Barney Rubble <barney@npmjs.com> (http://barnyrubble.npmjs.com/)"
	if (typeof authorData === "string") {
		// Try to extract email with regex
		const emailMatch = authorData.match(/<([^>]+)>/);
		const email = emailMatch ? emailMatch[1].trim() : undefined;

		// Try to extract website with regex
		const websiteMatch = authorData.match(/\(([^)]+)\)/);
		const website = websiteMatch ? websiteMatch[1].trim() : undefined;

		// Extract name by removing email and website parts if present
		let name = authorData.trim();
		if (emailMatch) name = name.replace(emailMatch[0], "").trim();
		if (websiteMatch) name = name.replace(websiteMatch[0], "").trim();

		return { name, email, website };
	}
	if (typeof authorData === "object") {
		// Handle object format: { name: "Barney Rubble", email: "barney@npmjs.com", website: "http://barnyrubble.npmjs.com/" }
		return {
			name: authorData.name,
			email: authorData.email,
			website: authorData.website,
		};
	}
}

/**
 * Gets author data by checking multiple possible locations in package.json
 *
 * @param pkgJsonData The package.json data object
 * @returns Author data with name, email and website
 */
export function getAuthorFromPackage(pkgJsonData: PackageI18n): {
	name: string;
	email?: string;
	website?: string;
} {
	// Check multiple possible locations for author information
	const locations = [
		"author", // Standard author field
		"authors", // Some packages use authors (plural)
		"contributors", // Try contributors if no author
		"maintainers", // Try maintainers as last resort
	];

	// Try each location in order
	for (const location of locations) {
		if (pkgJsonData[location]) {
			let authorData: {
				name: string;
				email?: string;
				website?: string;
			};
			if (typeof pkgJsonData[location] === "string") {
				authorData = extractAuthorData(pkgJsonData[location]);
			} else if (typeof pkgJsonData[location] === "object") {
				for (const author of pkgJsonData[location]) {
					if (!author) continue;
					authorData = extractAuthorData(author);
					if (authorData) break;
				}
			}
			if (
				authorData?.name !== "AUTHOR" ||
				authorData?.email !== "AUTHOR EMAIL"
			) {
				return authorData;
			}
		}
	}

	// If no valid author data found in any location
	return { name: "AUTHOR", email: "AUTHOR EMAIL" };
}

/**
 * This function consolidates the user headers data into a single object
 *
 * @param args the command line arguments
 * @return {Record<string, string>} the consolidated headers data object
 */
function consolidateUserHeaderData(args: Args): I18nHeaders {
	const pkgJsonData = getPkgJsonData(
		args.paths?.cwd,
		"name",
		"version",
		"author",
		"authors",
		"contributors",
		"maintainers",
	) as Record<[keyof PackageI18n], string>;
	// get author data from package.json
	const pkgAuthor = getAuthorFromPackage(pkgJsonData);

	// get the current directory name as slug
	const currentDir = path
		.basename(args.paths?.cwd || process.cwd())
		?.toLowerCase()
		.replace(" ", "-");

	// Use command line author name if provided, fallback to package.json
	const authorName = args?.headers?.author || pkgAuthor?.name;
	const email = args?.headers?.email || pkgAuthor?.email;
	// this is the author with email address in this format: author <email>
	const authorString = `${authorName} <${email}>`;
	const slug =
		args.slug ||
		currentDir ||
		args.headers?.name?.toString().replace(/ /g, "-") ||
		(args.domain === "theme" ? "THEME NAME" : "PLUGIN NAME");

	const bugs = `https://wordpress.org/support/${args.domain === "theme" ? "themes" : "plugins"}/${slug}`;

	return {
		...args.headers,
		name: args.headers?.name || slug,
		author: authorName,
		authorString: authorString, // this is the author with email address in this format: author <email>
		slug,
		email,
		bugs,
		license: args.headers?.license || "gpl-2.0 or later",
		version: args.headers?.version || pkgJsonData.version || "0.0.1",
		language: "en",
		xDomain: args.headers?.textDomain || slug,
	};
}

/**
 * Generates a POT header for a given set of arguments.
 * https://developer.wordpress.org/cli/commands/i18n/make-pot/
 * String that should be added as a comment to the top of the resulting POT file.
 * By default, a copyright comment is added for WordPress plugins and themes in the following manner:
 * `
 * Copyright (C) 2018 Example Plugin Author
 * This file is distributed under the same license as the Example Plugin package.
 * `
 * If a plugin or theme specifies a license in their main plugin file or stylesheet,
 * the comment looks like this: Copyright (C) 2018 Example Plugin Author This file is distributed under the GPLv2.
 *
 * @param args - The argument object containing the headers and their values.
 * @return The generated POT header.
 */
export async function generateHeader(
	args: Args,
): Promise<Record<string, string> | null> {
	// Consolidate the user headers data into a single object
	const headerData = consolidateUserHeaderData(args);

	// the makepot module name and version
	const { name, version } = getPkgJsonData(modulePath, "name", "version");

	// Validate required fields - exit early if validation fails
	if (!validateRequiredFields(headerData, args.debug)) {
		process.exit(1); // Exit with error code
		return null; // This is never reached but helps with TypeScript
	}

	return {
		"Project-Id-Version": `${headerData.name} ${headerData.version}`,
		"Report-Msgid-Bugs-To": headerData.bugs,
		"MIME-Version": "1.0",
		"Content-Transfer-Encoding": "8bit",
		"content-type": `text/plain; charset=${getEncodingCharset(args.options?.charset)}`,
		"plural-forms": "nplurals=2; plural=(n!=1);",
		"POT-Creation-Date": `${new Date().toISOString()}`,
		"PO-Revision-Date": `${new Date().getFullYear()}-MO-DA HO:MI+ZONE`,
		"Last-Translator": headerData.authorString,
		"Language-Team": headerData.authorString,
		"X-Generator": `${name} ${version}`,
		Language: `${headerData.language}`,
		"X-Domain": headerData.xDomain,
	};
}

/**
 * Extracts main file data based on the given arguments.
 *
 * @param {Args} args - The arguments for extracting the main file data.
 * @return {Record<string, string>} The extracted main file data.
 */
export function extractMainFileData(args: Args): Record<string, string> {
	let extractedData = {};
	if (["plugin", "block", "generic"].includes(args.domain)) {
		extractedData = extractPhpPluginData(args);
	} else if (["theme", "theme-block"].includes(args.domain)) {
		extractedData = extractCssThemeData(args);
	} else {
		console.log("No main file detected.");
	}

	return extractedData;
}

/**
 * Generate translation strings based on the given type and headers.
 *
 * @return {Record<string, string>} the generated translation strings
 * @param args
 */
export function translationsHeaders(args: Args): SetOfBlocks {
	const { domain, headers } = args as Args;
	const { name, description, author, authorUri, url } = headers as {
		[key in PotHeaders]: string;
	};

	// the main file is the plugin main php file or the css file
	const fakePath = domain === "plugin" ? `${args.slug}.php` : "style.css";

	return new SetOfBlocks([
		buildBlock(`Name of the ${domain}`, name, [fakePath]),
		buildBlock(`Url of the ${domain}`, url, [fakePath]),
		buildBlock(`Description of the ${domain}`, description, [fakePath]),
		buildBlock(`Author of the ${domain}`, author, [fakePath]),
		buildBlock(`Author URI of the ${domain}`, authorUri, [fakePath]),
	]);
}
