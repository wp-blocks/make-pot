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
	__: 'text_domain',
	esc_attr__: 'text_domain',
	esc_html__: 'text_domain',
	esc_xml__: 'text_domain',
	_e: 'text_domain',
	esc_attr_e: 'text_domain',
	esc_html_e: 'text_domain',
	esc_xml_e: 'text_domain',
	_x: 'text_context_domain',
	_ex: 'text_context_domain',
	esc_attr_x: 'text_context_domain',
	esc_html_x: 'text_context_domain',
	esc_xml_x: 'text_context_domain',
	_n: 'single_plural_number_domain',
	_nx: 'single_plural_number_context_domain',
	_n_noop: 'single_plural_domain',
	_nx_noop: 'single_plural_context_domain',

	// Compat.
	_: 'gettext', // Same as 'text_domain'.

	// Deprecated.
	_c: 'text_domain',
	_nc: 'single_plural_number_domain',
	__ngettext: 'single_plural_number_domain',
	__ngettext_noop: 'single_plural_domain',
}
