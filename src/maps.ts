export const themeJson = {
	title: 'Style variation name',
	settings: {
		typography: {
			fontSizes: [
				{
					name: 'Font size name',
				},
			],
			fontFamilies: [
				{
					name: 'Font family name',
				},
			],
		},
		color: {
			palette: [
				{
					name: 'Color name',
				},
			],
			gradients: [
				{
					name: 'Gradient name',
				},
			],
			duotone: [
				{
					name: 'Duotone name',
				},
			],
		},
		spacing: {
			spacingSizes: [
				{
					name: 'Space size name',
				},
			],
		},
		blocks: {
			'*': {
				typography: {
					fontSizes: [
						{
							name: 'Font size name',
						},
					],
					fontFamilies: [
						{
							name: 'Font family name',
						},
					],
				},
				color: {
					palette: [
						{
							name: 'Color name',
						},
					],
					gradients: [
						{
							name: 'Gradient name',
						},
					],
				},
				spacing: {
					spacingSizes: [
						{
							name: 'Space size name',
						},
					],
				},
			},
		},
	},
	customTemplates: [
		{
			title: 'Custom template name',
		},
	],
	templateParts: [
		{
			title: 'Template part name',
		},
	],
} as const

export type ThemeJson = typeof themeJson
export type ThemeJsonKeys = keyof typeof themeJson

export const blockJson = {
	title: 'block title',
	name: 'block/name',
	description: 'block description',
	keywords: [],
	styles: [
		{
			label: 'block style label',
		},
	],
	examples: {
		attributes: {
			message: 'Hello 👋\n\nHello, $name!',
		},
	},
	variations: [
		{
			title: 'block variation title',
			description: 'block variation description',
			keywords: ['block variation keyword'],
		},
	],
} as const

export type BlockJson = typeof blockJson
export type BlockJsonKeys = keyof typeof blockJson

export const pkgJsonHeaders = {
	name: 'name',
	url: 'homepage',
	description: 'description',
	author: 'author',
	version: 'version',
	bugs: 'bugs', // this can be an object
	license: 'license',
	repository: 'repository',
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
