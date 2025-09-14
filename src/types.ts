import type { GetTextTranslation } from "gettext-parser";
import type { pkgJsonHeaders, pluginHeaders, themeHeaders } from "./const.js";

export type ThemeHeadersType = typeof themeHeaders;
export type PluginHeadersType = typeof pluginHeaders;
export type PkgHeadersType = typeof pkgJsonHeaders;

/**
 * The args headers Object types
 */
export type PotHeaders =
	| keyof PkgHeadersType
	| keyof PluginHeadersType
	| keyof ThemeHeadersType
	| "license"
	| "email"
	| "language"
	| "domain"
	| "bugs";

// type is the value of the themeHeader Object
export type DomainType =
	| "plugin"
	| "theme"
	| "block"
	| "theme-block"
	| "generic";

/**
 * The patterns to use when extracting strings from files.
 *
 * @param {string} mergePaths - Comma-separated list of POT files whose contents should be merged with the extracted strings.
 *   If left empty, defaults to the destination POT file. POT file headers will be ignored.
 * @param {string} subtractPaths - Comma-separated list of POT files whose contents should act as some sort of denylist
 *   for string extraction. Any string which is found on that denylist will not be extracted. This can be useful when
 *   you want to create multiple POT files from the same source directory with slightly different content and no duplicate
 *   strings between them.
 * @param {boolean} subtractAndMerge - Whether source code references and comments from the generated POT file should be
 *   instead added to the POT file used for subtraction. Warning: this modifies the files passed to `subtractPaths`!
 * @param {string} include - Comma-separated list of files and paths that should be used for string extraction.
 *   If provided, only these files and folders will be taken into account for string extraction.
 *   For example, `--include="src,my-file.php` will ignore anything besides `my-file.php` and files in the `src`
 *   directory. Simple glob patterns can be used, i.e. `--include=foo-*.php` includes any PHP file with the `foo-`
 *   prefix. Leading and trailing slashes are ignored, i.e. `/my/directory/` is the same as `my/directory`.
 * @param {string} exclude - Comma-separated list of files and paths that should be skipped for string extraction.
 *   For example, `--exclude=.github,myfile.php` would ignore any strings found within `myfile.php` or the `.github`
 *   folder. Simple glob patterns can be used, i.e. `--exclude=foo-*.php` excludes any PHP file with the `foo-`
 *   prefix. Leading and trailing slashes are ignored, i.e. `/my/directory/` is the same as `my/directory`.
 *   The following files and folders are always excluded: node_modules, .git, .svn, .CVS, .hg, vendor, *.min.js.
 */
export interface Patterns {
	mergePaths?: string[];
	subtractPaths?: string[];
	subtractAndMerge?: boolean;
	include: string[];
	exclude: string[];
}

/**
 * Create a POT file for a WordPress project.
 *
 * Scans PHP, Blade-PHP, and JavaScript files for translatable strings, as well as theme stylesheets and plugin files
 * if the source directory is detected as either a plugin or theme.
 *
 * @param {string} sourceDirectory - Directory to scan for string extraction.
 * @param {string} destination - Name of the resulting POT file.
 * @param {string | undefined} slug - Plugin or theme slug. Defaults to the source directory's basename.
 * @param {'plugin' | 'theme' | 'block' | 'theme-block' | 'generic'} domain - Text domain to look for in the source code,
 *   unless the `ignoreDomain` option is used. By default, the "Text Domain" header of the plugin or theme is used.
 *   If none is provided, it falls back to the project slug.
 * @param {boolean} ignoreDomain - Ignore the text domain completely and extract strings with any text domain.
 * @param {{}} headers - Array in JSON format of custom headers which will be added to the POT file. Defaults to empty array.
 * @param {boolean} location - Whether to write `#: filename:line` lines. Defaults to true, use `--no-location`
 *   to skip the removal. Note that disabling this option makes it harder for technically skilled translators
 *   to understand each message’s context.
 * @param {boolean} skipJs - Skips JavaScript string extraction. Useful when this is done in another build step, e.g. through Babel.
 * @param {boolean} skipPhp - Skips PHP string extraction.
 * @param {boolean} skipBlade - Skips Blade-PHP string extraction.
 * @param {boolean} skipBlockJson - Skips string extraction from block.json files.
 * @param {boolean} skipThemeJson - Skips string extraction from theme.json files.
 * @param {boolean} skipAudit - Skips string audit where it tries to find possible mistakes in translatable strings.
 *   Useful when running in an automated environment.
 * @param {string} fileComment - String that should be added as a comment to the top of the resulting POT file.
 *   By default, a copyright comment is added for WordPress plugins and themes.
 * @param {string} packageName - Name to use for the package name in the resulting POT file's `Project-Id-Version` header.
 *   Overrides the plugin or theme name, if applicable.
 * @param {boolean} silent - Whether to hide progress information.
 */
export interface Args {
	slug: string;
	debug: boolean;
	domain: DomainType;
	paths: {
		cwd: string;
		out: string;
		root?: string;
	};
	options?: {
		ignoreDomain?: boolean;
		silent?: boolean;
		json?: boolean;
		location?: boolean;
		packageName?: string;
		headers: { [key in PotHeaders]: string };
		output?: boolean;
		fileComment?: string;
		charset?: string;
		skip: {
			js?: boolean;
			php?: boolean;
			blade?: boolean;
			blockJson?: boolean;
			themeJson?: boolean;
			audit?: boolean;
		};
		translationDomains?: string[];
	};
	headers?: { [key in PotHeaders]: string };
	patterns: Patterns;
}

/**
 * The arguments for the `makeJson` command.
 * 	@param {string} source the source directory
 * 	@param {string | null} destination the destination directory (defaults to source)
 * 	@param {string[] | null} allowedFormats the allowed files
 * 	@param {boolean} purge remove old json files (otherwise the content will be merged)
 * 	@param {boolean} prettyPrint?: pretty print json
 * 	@param {boolean} debug: enable debug mode
 */
export interface MakeJsonArgs {
	timeStart: number;
	prettyPrint: boolean;
	debug: boolean;
	destination: string;
	scriptName?: string;
	purge: boolean;
	stripUnused: boolean;
	source: string;
	slug: string;
	allowedFormats?: string[];
	paths: {
		cwd: string;
		out?: string;
		root?: string;
	};
}

export interface I18nSchema {
	[key: string]: string | string[] | I18nSchema | I18nSchema[];
}

/**
 * Translation string metadata.
 * Gettext format: https://www.gnu.org/savannah-checkouts/gnu/gettext/FAQ.html
 *
 * @property {string} msgctxt - context for this translation, if not present the default context applies
 * @property {string} msgid - string to be translated
 * @property {string} msgid_plural the plural form of the original string (might not be present)
 * @property {string[]} msgstr  an array of translations
 * @property {{}} comments an object with the following properties: translator, reference, extracted, flag, previous.
 */
export interface TranslationStrings {
	[msgctxt: string]: { [msgId: string]: GetTextTranslation };
}

/** The header of the JED file. */
export interface JedHeader {
	domain: string;
	lang: string;
	plural_forms: string;
	[key: string]: string;
}

/**
 * The JSON data returned by the `makeJson` command.
 * @param {string} domain
 * @param {Record<string, string | string[] | JedHeader>} locale_data
 */
export interface JedData {
	[domain: string]: {
		[key: string]: string | string[] | JedHeader;
	};
}

export interface MakeJson {
	domain: string;
	generator: string;
	"translation-revision-date": string;
	source: string;
	locale_data: JedData;
}

/**
 * The header data of the current plugin / theme as returned by the `extractHeaders` command.
 */
export interface I18nHeaders {
	name: string;
	authorString: string;
	bugs: string;
	license: string;
	author?: string;
	xDomain: string;
	language: string;
	version: string;
	slug: string;
	email: string | undefined;
}
