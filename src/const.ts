export const SPRINTF_PLACEHOLDER_REGEX =
  /(?:[^%]|^)(%[+-]?(?:0|'.)?-?[0-9]*(?:\.[0-9]+)?[bcdeEfFgGosuxX])/;

export const UNORDERED_SPRINTF_PLACEHOLDER_REGEX =
  /(?:[^%]|^)(%[+-]?(?:0|'.)?-?[0-9]*(?:\.\d+)?[bcdeEfFgGosuxX])/;

// Regular expression to match translator comments and translation i18nFunctions in code
export const TRANSLATIONS_REGEX =
  /(?!\/\*|\/\/)\s*(?:translators:(.*?)\s.*)?(?:__|_e|_n|_x|_nx)\s*\(\s*(['"])(.*?)\2(?:\s*,\s*(['"])(.*?)\4)?\s*\)/gm;

export const DEFAULT_EXCLUDED_PATH = [
  "node_modules/**",
  "vendor/**",
  "build/**",
  "dist/**",
  "Gruntfile.js",
  "webpack.config.js",
  "*.min.js",
  "ts.config.js",
  "**.test.**",
  "tests/**",
];

export const prefixes = {
  __: ["msgid"],
  _n: ["msgid", "msgid_plural"],
  _x: ["msgid", "msgctxt"],
  _nx: ["msgid", "msgid_plural", null, "msgctxt"],
};

export const pkgJsonHeaders = {
  name: "name",
  homepage: "url",
  description: "description",
  author: "author",
  version: "version",
  bugs: "bugs",
  license: "license",
  repository: "repository",
};
export const pluginHeaders = {
  "Plugin Name": "name",
  "Plugin URI": "url",
  Description: "description",
  Author: "author",
  "Author URI": "authorUrl",
  Version: "version",
  License: "license",
  "Domain Path": "domainPath",
  "Text Domain": "textDomain",
} as const;

export const themeHeaders = {
  "Theme Name": "name",
  "Theme URI": "url",
  Description: "description",
  Author: "author",
  "Author URI": "authorUrl",
  Version: "version",
  License: "license",
  "Domain Path": "domainPath",
  "Text Domain": "textDomain",
} as const;

export const i18nFunctions = {
  __: "text_domain",
  esc_attr__: "text_domain",
  esc_html__: "text_domain",
  esc_xml__: "text_domain",
  _e: "text_domain",
  esc_attr_e: "text_domain",
  esc_html_e: "text_domain",
  esc_xml_e: "text_domain",
  _x: "text_context_domain",
  _ex: "text_context_domain",
  esc_attr_x: "text_context_domain",
  esc_html_x: "text_context_domain",
  esc_xml_x: "text_context_domain",
  _n: "single_plural_number_domain",
  _nx: "single_plural_number_context_domain",
  _n_noop: "single_plural_domain",
  _nx_noop: "single_plural_context_domain",

  // Compat.
  _: "gettext", // Same as 'text_domain'.

  // Deprecated.
  _c: "text_domain",
  _nc: "single_plural_number_domain",
  __ngettext: "single_plural_number_domain",
  __ngettext_noop: "single_plural_domain",
};
