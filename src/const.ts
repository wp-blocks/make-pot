export const SPRINTF_PLACEHOLDER_REGEX = /(?:[^%]|^)(%[+-]?(?:0|'.)?-?[0-9]*(?:\.[0-9]+)?[bcdeEfFgGosuxX])/

export const UNORDERED_SPRINTF_PLACEHOLDER_REGEX = /(?:[^%]|^)(%[+-]?(?:0|'.)?-?[0-9]*(?:\.\d+)?[bcdeEfFgGosuxX])/

export const DEFAULT_EXCLUDED_PATH = ['node_modules/**', 'vendor/**', 'build/**', 'dist/**', '.*', 'Gruntfile.js', 'webpack.config.js', '*.min.js', 'ts.config.js', '**.test.**', 'tests/**']

export const prefixes = {
  __: ['msgid'],
  _n: ['msgid', 'msgid_plural'],
  _x: ['msgid', 'msgctxt'],
  _nx: ['msgid', 'msgid_plural', null, 'msgctxt']
}

export const pkgJsonHeaders = ['name', 'author', 'description', 'version']
export const pluginHeaders = [
  'Plugin Name',
  'Plugin URI',
  'Description',
  'Author',
  'Author URI',
  'Version',
  'License',
  'Domain Path',
  'Text Domain'
]

export const themeHeaders = [
  'Theme Name',
  'Theme URI',
  'Description',
  'Author',
  'Author URI',
  'Version',
  'License',
  'Domain Path',
  'Text Domain'
]
