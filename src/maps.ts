import * as blocki18n from './assets/block-i18n.json'
import * as themei18n from './assets/theme-i18n.json'
export const themeJson = themei18n

export type ThemeJson = typeof themeJson
export type ThemeJsonKeys = keyof typeof themeJson

export const blockJson = blocki18n

export type BlockJson = typeof blockJson
export type BlockJsonKeys = keyof typeof blockJson

export interface pkgJsonHeaders {
	name: string
	url: string
	description: string
	author: string
	version: string
	bugs: string | { url: string; email: string } // this can be an object
	license: string
	repository: string
}

export const pluginHeaders = {
	name: 'Plugin Name',
	url: 'Plugin URI',
	description: 'Description',
	author: 'Author',
	authorUrl: 'Author URI',
	version: 'Version',
	license: 'License URI',
	domainPath: 'Domain Path',
	textDomain: 'Text Domain',
} as const

export const themeHeaders = {
	name: 'Theme Name',
	url: 'Theme URI',
	description: 'Description',
	author: 'Author',
	authorUrl: 'Author URI',
	version: 'Version',
	license: 'License',
	domainPath: 'Domain Path',
	textDomain: 'Text Domain',
} as const
