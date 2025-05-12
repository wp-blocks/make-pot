import { SetOfBlocks } from "gettext-merger";
import type { Args, PotHeaders } from "../types.js";
import { getPkgJsonData } from "../utils/common";
import { extractCssThemeData } from "./css.js";
import { extractPhpPluginData } from "./php.js";
import { gentranslation } from "./utils.js";

/**
 * Checks if required fields are missing and logs a clear error message
 * @param {object} headerData - The header data to validate
 * @returns {boolean} - true if all required fields are present, false otherwise
 */
function validateRequiredFields(headerData: any): boolean {
	const requiredFields = [
		{ key: "slug", name: "Plugin/Theme slug", placeholder: "PLUGIN NAME" },
		{ key: "author", name: "Author name", placeholder: "AUTHOR" },
		{ key: "version", name: "Version", placeholder: "" },
		{ key: "email", name: "Author email", placeholder: "AUTHOR EMAIL" },
		{ key: "domain", name: "Text domain", placeholder: "PLUGIN TEXTDOMAIN" },
	];

	const missingFields = requiredFields.filter(
		(field) =>
			!headerData[field.key] ||
			headerData[field.key] === field.placeholder ||
			(field.key === "version" &&
				headerData[field.key] === "0.0.1" &&
				!headerData.explicitVersion),
	);

	if (missingFields.length > 0) {
		console.error("\n!  Missing required information for POT file header:\n");

		missingFields.forEach((field) => {
			console.error(`   - ${field.name} is missing or has a default value`);
		});

		console.error(
			"\nPlease provide this information adding the missing fields inside the headers object of the plugin/theme declaration or to the package.json file.",
			"\nFor more information check the documentation at https://github.com/wp-blocks/makePot",
		);

		console.error("\n");

		return false;
	}

	return true;
}

/**
 * Extract author data from package.json author field and return an array of strings
 * the original field is a string and it's longer form is "Your Name <email@example.com> (https://example.com)"
 *
 * @param author the author field from package.json
 * @returns an object with name, email, and website
 */
function extractAuthorData(authorData: any): {
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
function getAuthorFromPackage(pkgJsonData: any): {
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
			let authorData;
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
function consolidateUserHeaderData(args: Args): {
	authorString: string;
	bugs: string;
	license: string;
	author: any;
	domain: string;
	xDomain: string;
	language: string;
	version: string;
	slug: string;
	email?: string;
} {
	const { author, textDomain } = args.headers as {
		[key in PotHeaders]: string;
	};

	const pkgJsonData = getPkgJsonData(
		"name",
		"version",
		"author",
		"authors",
		"contributors",
		"maintainers",
	) as {
		[key: string]: any;
	};

	const bugs = `https://wordpress.org/support/${args.domain === "theme" ? "themes" : "plugins"}/${args.slug}`;

	// get author data from package.json
	const pkgAuthor = getAuthorFromPackage(pkgJsonData);
	// Use command line author name if provided, fallback to package.json
	const authorName = args.headers?.author || pkgAuthor?.name;
	const email = pkgAuthor?.email;
	// this is the author with email address in this format: author <email>
	const authorString = `${author} <${email}>`;
	// if textDomain is provided, add it to the header
	const xDomain = textDomain ? `X-Domain: ${textDomain}` : "";
	// get the current directory name as slug
	const currentDir = process
		.cwd()
		.split("/")
		.pop()
		?.toLowerCase()
		.replace(" ", "-");
	const slug =
		currentDir || args.slug || args.domain === "theme"
			? "THEME NAME"
			: "PLUGIN NAME";

	return {
		...args.headers,
		author: authorName,
		authorString: authorString, // this is the author with email address in this format: author <email>
		slug: args.slug || "PLUGIN NAME",
		email,
		bugs,
		license: args.headers?.license || "gpl-2.0 or later",
		version: args.headers?.version || pkgJsonData?.version || "1.0.0",
		language: "en",
		domain:
			args.headers?.textDomain || args.headers?.slug || "PLUGIN TEXTDOMAIN",
		xDomain,
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
export function generateHeader(args: Args) {
	const { author, textDomain } = args.headers as {
		[key in PotHeaders]: string;
	};
	const { name, version } = getPkgJsonData("name", "version");
	const email = "EMAIL";
	const language = "en";
	const authorString = `${author} <${email}>`;
	const domain = textDomain ? `X-Domain: ${textDomain}` : "";
	const bugs = {
		url:
			//args.headers?.bugsUrl ||
			"https://wordpress.org/support/plugin/" + args.slug,
		email:
			// args.headers?.bugsEmail ||
			email || "AUTHOR EMAIL",
	};
	const headerData = {
		...args.headers,
		author: args.headers?.author || "AUTHOR",
		slug: args.slug || "PLUGIN NAME",
		email: email,
		license: args.headers?.license || "gpl-2.0 or later",
		version: args.headers?.version || "1.0.0",
		language: language,
		domain: args.headers?.textDomain || args.headers?.slug || "PLUGIN DOMAIN",
	};

	return {
		"Project-Id-Version": `${headerData.slug} ${headerData.version}`,
		"Report-Msgid-Bugs-To": authorString,
		"MIME-Version": `1.0`,
		"Content-Transfer-Encoding": `8bit`,
		"content-type": "text/plain; charset=iso-8859-1",
		"plural-forms": "nplurals=2; plural=(n!=1);",
		"POT-Creation-Date": `${new Date().toISOString()}`,
		"PO-Revision-Date": `${new Date().getFullYear()}-MO-DA HO:MI+ZONE`,
		"Last-Translator": authorString,
		"Language-Team": authorString,
		"X-Generator": `${name} ${version}`,
		Language: `${language}`,
		// add domain if specified
		domain,
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
		gentranslation(`Name of the ${domain}`, name, fakePath),
		gentranslation(`Url of the ${domain}`, url, fakePath),
		gentranslation(`Description of the ${domain}`, description, fakePath),
		gentranslation(`Author of the ${domain}`, author, fakePath),
		gentranslation(`Author URI of the ${domain}`, authorUri, fakePath),
	]);
}
