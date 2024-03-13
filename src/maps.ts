import * as blocki18n from './assets/block-i18n.json'
import * as themei18n from './assets/theme-i18n.json'
import { name, version, description } from '../package.json'

export const pkgJson: Record<string, unknown> = {
	name,
	version,
	description,
}
export const themeJson = themei18n
export const blockJson = blocki18n

export const pluginJson = blocki18n

export type pkgJsonHeaders = {
	name: string
	url: string
	description: string
	author: string
	authorEmail: string
	version: string
	bugs: string // this can be an object | { url: string; email: string }
	license: string
	repository: string
}

export const pluginHeaders = {
	name: 'Plugin Name',
	url: 'Plugin URI',
	description: 'Description',
	version: 'Version',
	wpMinimumVersion: 'Requires at least',
	phpMinimumVersion: 'Requires PHP',
	author: 'Author',
	authorUrl: 'Author URI',
	license: 'License',
	licenseUri: 'License URI',
	updateUri: 'Update URI',
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
