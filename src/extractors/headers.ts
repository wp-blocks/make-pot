import { SetOfBlocks } from "gettext-merger";
import type { Args, PotHeaders } from "../types.js";
import { getPkgJsonData } from "../utils/common";
import { extractCssThemeData } from "./css.js";
import { extractPhpPluginData } from "./php.js";
import { gentranslation } from "./utils.js";

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
