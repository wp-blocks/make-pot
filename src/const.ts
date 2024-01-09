export const SPRINTF_PLACEHOLDER_REGEX = /(?:[^%]|^)(%[+-]?(?:0|'.)?-?[0-9]*(?:\.[0-9]+)?[bcdeEfFgGosuxX])/

export const UNORDERED_SPRINTF_PLACEHOLDER_REGEX = /(?:[^%]|^)(%[+-]?(?:0|'.)?-?[0-9]*(?:\.\d+)?[bcdeEfFgGosuxX])/

// Regular expression to match translator comments and translation functions in code
export const TRANSLATIONS_REGEX = /(?!\/\*|\/\/)\s*(?:translators:(.*?)\s.*)?(?:__|_e|_n|_x|_nx)\s*\(\s*(['"])(.*?)\2(?:\s*,\s*(['"])(.*?)\4)?\s*\)/gm

export const DEFAULT_EXCLUDED_PATH = ['node_modules/**', 'vendor/**', 'build/**', 'dist/**', 'Gruntfile.js', 'webpack.config.js', '*.min.js', 'ts.config.js', '**.test.**', 'tests/**']

export const prefixes = {
  __: ['msgid'],
  _n: ['msgid', 'msgid_plural'],
  _x: ['msgid', 'msgctxt'],
  _nx: ['msgid', 'msgid_plural', null, 'msgctxt']
}

export const pkgJsonHeaders = {
  name: 'name',
  homepage: 'url',
  description: 'description',
  author: 'author',
  version: 'version',
  bugs: 'bugs',
  license: 'license'
}
export const pluginHeaders = {
  'Plugin Name': 'name',
  'Plugin URI': 'url',
  Description: 'description',
  Author: 'author',
  'Author URI': 'authorUrl',
  Version: 'version',
  License: 'license',
  'Domain Path': 'domainPath',
  'Text Domain': 'textDomain'
}

export const themeHeaders = {
  'Theme Name': 'name',
  'Theme URI': 'url',
  Description: 'description',
  Author: 'author',
  'Author URI': 'authorUrl',
  Version: 'version',
  License: 'license',
  'Domain Path': 'domainPath',
  'Text Domain': 'textDomain'
}
