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
	'css',
	'html',
	'json',
	'md',
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
	_x: ['text', 'msgctxt', 'text_domain'],
	_ex: ['text', 'msgctxt', 'text_domain'],
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
