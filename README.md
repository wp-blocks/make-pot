[![](https://img.shields.io/npm/v/@wp-blocks/make-pot.svg?label=npm%20version)](https://www.npmjs.com/package/@wp-blocks/make-pot)
[![](https://img.shields.io/npm/l/@wp-blocks/make-pot)](https://github.com/wp-blocks/make-pot?tab=GPL-3.0-1-ov-file#readme)
[![](https://github.com/wp-blocks/make-pot/actions/workflows/node.js.yml/badge.svg)](https://github.com/wp-blocks/make-pot/actions/workflows/node.js.yml)

## Make POT

`make-pot` is a Node.js module designed to generate the `.pot` file for your WordPress plugin or theme. This file serves as the basis for internationalization, allowing translators to localize your plugin or theme into different languages.

Extract strings from your WordPress plugin or theme and generate a `.pot` file. Works with `js`, `jx`, `ts`, `tsx`, `cjs`, `mjs`,  `php`, `blade`, `txt`, `json` with a custom schema for theme and block.json files.

## Make JSON
`make-json` is a Node.js module designed to convert `.po` files into JSON format for your WordPress plugin or theme. This conversion facilitates client-side translations and enables your JavaScript code to use the translated strings.

Transform your translation files into a JSON format compatible with WordPress i18n package. This module simplifies the process of making your WordPress plugin or theme fully translatable on the frontend.

## Installation

You can install `make-pot` as a dependecy via npm:

```
npm install -d @wp-blocks/make-pot
```

or globally

```
npm install -g @wp-blocks/make-pot
```

### Usage

```bash
# without installation
npx @wp-blocks/make-pot [sourceDirectory] [destination] [options]
npx -p @wp-blocks/make-pot makejson [sourceDirectory] [destination] [options]

# installed
npx makepot [sourceDirectory] [destination] [options]
npx makejson [sourceDirectory] [destination] [options]
```

## Make Pot

Example usage:

```bash
# without installation
npx @wp-blocks/make-pot src languages --charset='utf-8' --include="src/**/*.{ts,tsx},inc/**/*,admin/**/*.{php}"
```

#### Positional Arguments:

- `sourceDirectory` (optional): Specifies the source directory of your plugin or theme. If not provided, the `.pot` file root will be the source directory.
- `destination` (optional): Specifies the destination directory where the `.pot` file will be generated. If not provided, the `.pot` file will be created in the source directory.

#### Make Pot Options:

- `--version`: Displays the version number of `make-pot`.
- `-h`, `--help`: Displays help information.
- `--slug <slug>`: Specifies the plugin or theme slug.
- `--domain <domain>`: Specifies the text domain to look for in the source code.
- `--skip-js`: Skips JavaScript files during processing.
- `--skip-php`: Skips PHP files during processing.
- `--skip-blade`: Skips Blade files during processing.
- `--skip-block-json`: Skips block.json files during processing.
- `--skip-theme-json`: Skips theme.json files during processing.
- `--skip-audit`: Skips auditing of strings.
- `--headers <headers>`: Specifies additional headers for the `.pot` file. Accepts an array of strings (--headers=email:erik@ck.it,domain:my-block) or multiple values (--headers=email:erik@ck.it --headers=domain:my-block)
- `--file-comment <comment>`: Specifies the file comment for the `.pot` file.
- `--package-name <name>`: Specifies the package name.
- `--location`: Includes location information in the `.pot` file.
- `--ignore-domain`: Ignores text domain in the processing.
- `--mergePaths <paths>`: Merges with existing POT file(s).
- `--subtractPaths <paths>`: Subtracts strings from existing POT file(s).
- `--subtractAndMerge`: Subtracts and merges strings from existing POT file(s).
- `--include <files>`: Includes specific files for processing.
- `--exclude <files>`: Excludes specific files from processing.
- `--silent`: Suppresses output to stdout.
- `--json`: Outputs the JSON gettext data.
- `--charset`: Defines the encoding charset of the pot file, you can choose "iso-8859-1" and "uft-8" (defaults to iso-8859-1)
- `--translation-domains`: Restrict to specific translation domains.
- `--output`: Outputs the gettext data.

### Example usage

First of all remember that the 'make-pot' help can be printed using the command `npx @wp-blocks/make-pot -h`, and the help for the json command can be printed using the command `npx make-json -h`. the commands are available after installing the module (`npm install @wp-blocks/make-pot`)

#### Using `make-pot` in your `package.json` (assiming you have already installed the makepot command)
```bash
	"scripts": {
		"build": "npm run build:scripts && npm run build:makepot",
		"build:scripts": "wp-scripts build",
		"build:makepot": "npx makepot",
		"build-2:makejson": "npx makejson",
	}
```
> Note: that it should be launched after creating the “.po” files with the localized translations (and then at a later time)

Both command does not need any arguments, they will parse the required data from the plugin file (the one in the root directory with the same name of the folder) or the theme.json/theme css file in the case of themes.
So what you should check before running the command is to have all the WordPress and Node.js required data/metadata in place, nothing else. Anyway, the command can be customized if you need, let's see some examples:

#### Using `make-pot` include and exclude files
We use glob module to include and exclude files. please check [glob](https://github.com/isaacs/node-glob)

```bash
	# Every file in includes, frontend and admin directories that is not in node_modules
	npx @wp-blocks/make-pot --include='includes/**/*,frontend/**/*,admin/**/*' --exclude="**/node_modules/**"

	# Every file that is a tsx, ts, js and not in node_modules
	npx @wp-blocks/make-pot --include='**/*.{tsx,ts,js}' --exclude="**/node_modules/**"

	# Merge the resulting pot file with another pot file
	npx @wp-blocks/make-pot --mergePaths='path/to/other.pot'

	# Remove the strings from the resulting pot file with another pot file
	npx @wp-blocks/make-pot --subtractPaths='path/to/other.pot'
```

#### Tip:
The include and exclude options works in a different way... the include option adds the files to the default list of files to be processed, while the exclude option replaces the original list and excludes the specified files/directories.
The mergePaths option will merge the resulting pot file with another pot file, while the subtractPaths option will subtract the strings from the resulting pot file with another pot file.

## As a build chain step

The `make-pot` module can be used as a build step in your build chain.
To do so, create a `build:makepot` action in your `package.json` with the following content (refer to the [options](https://github.com/wp-blocks/make-pot?tab=readme-ov-file#options) for more information):

```json
{
	"build:makepot": "npx @wp-blocks/make-pot [sourceDirectory] [destination] [options]"
}
```
---

# Make JSON

### Why JSON Translation for WordPress JavaScript?

#### Overview
WordPress 5.0 introduced Gutenberg, a JavaScript-heavy editor. This shifted much of the internationalization (I18N) work from the server to the client side. While functions like `wp_localize_script()` were used before, Gutenberg required a more robust solution.

#### JavaScript Localization Functions
WordPress 5.0 introduced the `wp-i18n` JavaScript package, offering localization functions (`__()`, `_x()`, `_n()`, `_nx()`, `sprintf()`) similar to their PHP counterparts, enabling seamless I18N in JavaScript.

#### Loading Translations
To fully internationalize a plugin or theme, you must load translations using `wp_set_script_translations()`, which requires:
1. Script handle (e.g., `my-plugin-script`)
2. Text domain (e.g., `my-plugin`)
3. Optional: Path to translation files (if not hosted on WordPress.org)

#### JSON Translation Files
Unlike traditional PO/MO files, JavaScript translations use JSON. This format is easily readable in JavaScript and compatible with the Jed JavaScript gettext library, used by the `wp-i18n` package. WordPress.org generates these JSON files automatically, but custom ones can be created if needed.

## JSON Utility args

- `source`: (positional) the source directory of your plugin or theme translations (e.g. `languages`).
- `destination`: (positional and optional) The destination directory where the `.json` file will be generated. If not provided, the `.json` file will be created in the source directory.
- `--scriptName`: The name of the script that needs this translation file.
- `--allowedFormats`: The allowed formats of the translation file (e.g. `js` or `tsx`).
- `--purge`: if enabled, removes the existing translation file. Otherwise, the old translation file will be merged with the new.
- `--prettyPrint`: Pretty prints the translation file.
- `--stripUnused`: strips unused translations from the translation file (default: true).
- `--debug`: Enables debug mode.

## How to Generate Json translations

#### Build the json translations file

First, build the translation pot file using `makepot` (no matter with this module or not) and then translate it into the different languages.

translate the pot file into your language and then run `makejson`:

```bash
npx makejson
# OR if you don't want to install the module
npx -p @wp-blocks/make-pot makejson,
```
It Will create a file for each po file in the `languages` directory with the md5 hash with the name of the file.
In this case, the file will be named my-frontend-script-en_US-79431f0eb8deb8221f24df5112e15095.json because the md5 hash of "build/frontend.js" is 79431f0eb8deb8221f24df5112e15095.
This is crucial because the md5 hash has to be the same as the path of the script file.

## Register the javascript block translations

```php
<?php
/**
 * Loads the plugin text domain for translation.
 */
function my_i18n() {
    load_plugin_textdomain( 'my-text-domain', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'my_i18n' );

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 */
add_action('init', function () {
	register_block_type( dirname( plugin_basename( __FILE__ ) ) . '/build', [
		"script" => "my-vendor-script",
		"viewScript" => "my-frontend-script",
		"editorScript" => "my-editor-script",
	]);
});

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 */
function my_register_block_type() {

	$fe_assets = include dirname( __FILE__ ) . '/build/my-frontend-script.asset.php';

	wp_register_script(
		'my-frontend-script',
		VSGE_MB_PLUGIN_URL . 'build/frontend.js',
		$fe_assets['dependencies'],
		$fe_assets['version']
	);

	// 1 - the name of the hook used to register the script
	// 2 - the text domaim of the block
	// 3 - the path to the translations directory
	wp_set_script_translations( 'my-frontend-script', 'my-text-domain', plugin_dir_url(__FILE__) . '/languages' );

	...
}
add_action( 'init', 'my_register_block_type' );
```

### Credits

This module is heavily inspired by the original `makepot` command from [WP-CLI](https://github.com/wp-cli/i18n-command).
Special thanks to the maintainers in particular [Swissspidy](https://github.com/swissspidy) which
has been very helpful with suggestions and tips on how to rebuild `make-pot`.

#### Useful links
- https://make.wordpress.org/core/2018/11/09/new-javascript-i18n-support-in-wordpress/
- https://pascalbirchler.com/internationalization-in-wordpress-5-0/

Feel free to contribute or report issues on [GitHub](https://github.com/example/example).

This tool is licensed under the [GNU General Public License v3](LICENSE).
