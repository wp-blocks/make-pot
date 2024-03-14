## make-pot

`make-pot` is a Node.js module designed to generate the `.pot` file for your WordPress plugin or theme. This file serves as the basis for internationalization, allowing translators to localize your plugin or theme into different languages.

Extract strings from your WordPress plugin or theme and generate a `.pot` file. Works with `js`, `jx`, `ts`, `tsx`, `php`, `blade`, `txt`, `json` with a custom schema for theme and block.json files.

### Installation

You can install `make-pot` globally via npm:

```
npm install -g @wp-blocks/make-pot
```

### Usage

```bash
npx @wp-blocks/make-pot <sourceDirectory> [destination] [options]
```

#### Positional Arguments:

- `sourceDirectory`: Specifies the source directory of your plugin or theme.
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

### Credits

This module is heavily inspired by the original `makepot` command from [WP-CLI](https://github.com/wp-cli/i18n-command).
Special thanks to the maintainers in particular [Swissspidy](https://github.com/swissspidy) which
has been very helpful with suggestions and tips on how to rebuild `make-pot`.

Feel free to contribute or report issues on [GitHub](https://github.com/example/example).
