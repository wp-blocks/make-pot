import * as blocki18n from './assets/block-i18n.json'
import * as themei18n from './assets/theme-i18n.json'
import * as packagei18n from './assets/package-i18n.json'
import * as wpThemei18n from './assets/wp-theme-i18n.json'
import * as wpPlugini18n from './assets/wp-plugin-i18n.json'
import { name, version, description } from '../package.json'

/**
 *  The makepot package.json file data
 *  @return {
 *      name: string,
 *      version: string,
 *      description: string
 *  } - The package.json data
 */
export const pkgJson: Record<string, unknown> = {
	name,
	version,
	description,
}

export const themeJson = themei18n
export const blockJson = blocki18n
export const pkgJsonHeaders = packagei18n
export const pluginHeaders = wpThemei18n
export const themeHeaders = wpPlugini18n

/**
 * The default list of paths to exclude from the pot file.
 * @link https://www.npmjs.com/package/glob#glob-primer
 */
export const DEFAULT_EXCLUDED_PATH = [
	'.git',
	'node_modules',
	'vendor',
	'build',
	'dist',
	'uploads',
	'Gruntfile.js',
	'webpack.config.js',
	'**/*.min.js',
	'tsconfig.js',
	'**.test.**',
	'tests',
]

export const allowedFiles = [
	'php',
	'js',
	'jsx',
	'ts',
	'tsx',
	'mjs',
	'cjs',
	'txt',
	'html',
	'json',
]
/**
 * The default functions to use for i18n.
 */
export const i18nFunctions = {
	__: ['msgid', 'text_domain'],
	esc_attr__: ['msgid', 'text_domain'],
	esc_html__: ['msgid', 'text_domain'],
	esc_xml__: ['msgid', 'text_domain'],
	_e: ['msgid', 'text_domain'],
	esc_attr_e: ['msgid', 'text_domain'],
	esc_html_e: ['msgid', 'text_domain'],
	esc_xml_e: ['msgid', 'text_domain'],
	_x: ['msgid', 'msgctxt', 'text_domain'],
	_ex: ['msgid', 'msgctxt', 'text_domain'],
	esc_attr_x: ['msgid', 'msgctxt', 'text_domain'],
	esc_html_x: ['msgid', 'msgctxt', 'text_domain'],
	esc_xml_x: ['msgid', 'msgctxt', 'text_domain'],
	_n: ['msgid', 'msgid_plural', 'number', 'text_domain'],
	_nx: ['msgid', 'msgid_plural', 'number', 'msgctxt', 'text_domain'],
	_n_noop: ['msgid', 'msgid_plural', 'text_domain'],
	_nx_noop: ['msgid', 'msgid_plural', 'msgctxt', 'text_domain'],

	// Compat.
	_: ['msgid', 'text_domain'],

	// Deprecated.
	_c: ['msgid', 'text_domain'],
	_nc: ['msgid', 'msgid_plural', 'number', 'text_domain'],
	__ngettext: ['msgid', 'msgid_plural', 'number', 'text_domain'],
	__ngettext_noop: ['msgid', 'msgid_plural', 'text_domain'],
}
