[![](https://img.shields.io/npm/v/@wp-blocks/make-pot.svg?label=npm%20version)](https://www.npmjs.com/package/@wp-blocks/make-pot)
[![](https://img.shields.io/npm/l/@wp-blocks/make-pot)](https://github.com/wp-blocks/make-pot?tab=GPL-3.0-1-ov-file#readme)
[![](https://github.com/wp-blocks/make-pot/actions/workflows/node.js.yml/badge.svg)](https://github.com/wp-blocks/make-pot/actions/workflows/node.js.yml)

## Make Pot

`make-pot` is a Node.js module designed to generate the `.pot` file for your WordPress plugin or theme. This file serves as the basis for internationalization, allowing translators to localize your plugin or theme into different languages.

Extract strings from your WordPress plugin or theme and generate a `.pot` file. Works with `js`, `jx`, `ts`, `tsx`, `cjs`, `mjs`,  `php`, `blade`, `txt`, `json` with a custom schema for theme and block.json files.

### Installation

You can install `make-pot` globally via npm:

```
npm install -g @wp-blocks/make-pot
```

### Usage

```bash
npx @wp-blocks/make-pot [sourceDirectory] [destination] [options]
```

#### Positional Arguments:

- `sourceDirectory` (optional): Specifies the source directory of your plugin or theme. If not provided, the `.pot` file root will be the source directory.
- `destination` (optional): Specifies the destination directory where the `.pot` file will be generated. If not provided, the `.pot` file will be created in the source directory.

#### Options:

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
- `--headers <headers>`: Specifies additional headers for the `.pot` file.
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
- `--output`: Outputs the gettext data.

## As a build chain step

The `make-pot` module can be used as a build step in your build chain.
To do so, create a `build:makepot` action in your `package.json` with the following content (refer to the [options](https://github.com/wp-blocks/make-pot?tab=readme-ov-file#options) for more information):

```json
{
	"build:makepot": "npx @wp-blocks/make-pot [sourceDirectory] [destination] [options]"
}
```

### Credits

This module is heavily inspired by the original `makepot` command from [WP-CLI](https://github.com/wp-cli/i18n-command).
Special thanks to the maintainers in particular [Swissspidy](https://github.com/swissspidy) which
has been very helpful with suggestions and tips on how to rebuild `make-pot`.

Feel free to contribute or report issues on [GitHub](https://github.com/example/example).

This tool is licensed under the [GNU General Public License v3](LICENSE).
