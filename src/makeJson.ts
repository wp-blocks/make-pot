import * as path from 'path'
import * as fs from 'fs'
import {
	Generator as PoGenerator,
	Translation,
	Translations,
} from 'gettext-parser'
import { debug, error, success, warning } from './wp-cli-utils'
// Import your utility functions
import { createHash } from 'node:crypto'

class MakeJsonCommand {
	protected json_options: number = 0

	public async invoke(
		args: string[],
		assocArgs: Record<string, any>
	): Promise<void> {
		assocArgs = parseShellArrays(assocArgs, ['use-map'])
		const purge: boolean = getFlagValue(assocArgs, 'purge', true)
		const updateMoFiles: boolean = getFlagValue(
			assocArgs,
			'update-mo-files',
			true
		)
		const mapPaths: string | string[] | null = getFlagValue(
			assocArgs,
			'use-map',
			false
		)

		if (getFlagValue(assocArgs, 'pretty-print', false)) {
			this.json_options |= 1
		}

		const source: string = path.resolve(args[0])

		if (
			!source ||
			!fs.existsSync(source) ||
			(!fs.statSync(source).isFile() &&
				!fs.statSync(source).isDirectory())
		) {
			error('Source file or directory does not exist!')
			return
		}

		let destination: string = fs.statSync(source).isFile()
			? path.dirname(source)
			: source

		if (args[1]) {
			destination = args[1]
		}

		const map: Record<string, string[]> | null = this.buildMap(mapPaths)
		if (map && Object.keys(map).length === 0) {
			error('No valid keys found. No file was created.')
			return
		}

		// Two fs.existsSync() checks in case of a race condition.
		if (
			!fs.existsSync(destination) &&
			!fs.mkdirSync(destination, { recursive: true }) &&
			!fs.existsSync(destination)
		) {
			error('Could not create destination directory!')
			return
		}

		let resultCount: number = 0

		const fb = await import('globby')

		const files: string[] = fs.statSync(source).isFile()
			? [source]
			: fb.globby(path.join(source, '**/*.po'))

		for (const file of files) {
			if (
				fs.statSync(file).isFile() &&
				fs.statSync(file) &&
				path.extname(file) === '.po'
			) {
				const result: string[] = this.makeJson(file, destination, map)
				resultCount += result.length

				if (purge) {
					const removed: boolean =
						this.removeJsStringsFromPoFile(file)

					if (!removed) {
						warning(
							`Could not update file ${path.basename(source)}`
						)
						continue
					}

					if (updateMoFiles) {
						const fileBasename: string = path.basename(file, '.po')
						const destinationFile: string = path.join(
							destination,
							`${fileBasename}.mo`
						)

						const translations: Translations =
							Translations.fromPoFile(file)
						if (!translations.toMoFile(destinationFile)) {
							warning(`Could not create file ${destinationFile}`)
						}
					}
				}
			}
		}

		success(
			`Created ${resultCount} ${resultCount === 1 ? 'file' : 'files'}.`
		)
	}

	protected buildMap(
		pathsOrMaps: string | string[] | null
	): Record<string, string[]> | null {
		if (pathsOrMaps === null) {
			return null
		}

		const map: Record<string, string[]> = {}

		if (
			!Array.isArray(pathsOrMaps) ||
			pathsOrMaps.some((key) => typeof key !== 'number')
		) {
			pathsOrMaps = [pathsOrMaps] as string[]
		}

		const paths: string[] = pathsOrMaps
			? pathsOrMaps.filter(
					(key): key is string => typeof key === 'string'
				)
			: []
		debug(
			`Using ${paths.length} map files: ${paths.join(', ')}`,
			'make-json'
		)

		const maps: Record<string, string[]>[] = pathsOrMaps.filter(
			(key): key is Record<string, string[]> => typeof key === 'object'
		)
		debug(`Using ${maps.length} inline map objects`, 'make-json')
		debug(
			`Dropping ${pathsOrMaps.length - paths.length - maps.length} invalid values from map argument`,
			'make-json'
		)

		const toTransform: Array<[Record<string, string[]>, string]> = maps.map(
			(value, index) => [value, `inline object ${index}`]
		)

		for (const mapPath of paths) {
			if (!fs.existsSync(mapPath) || fs.statSync(mapPath).isDirectory()) {
				warning(`Map file ${mapPath} does not exist`)
				continue
			}

			const json: Record<string, string[]> = JSON.parse(
				fs.readFileSync(mapPath, 'utf8')
			)
			if (!json || typeof json !== 'object') {
				warning(`Map file ${mapPath} invalid`)
				continue
			}

			toTransform.push([json, mapPath])
		}

		for (const transform of toTransform) {
			let [json, file] = transform
			const keyNum: number = Object.keys(json).length
			// normalize contents to string[]
			json = Object.fromEntries(
				Object.entries(json).map(([key, value]) => [
					key,
					Array.isArray(value)
						? value.filter((v) => typeof v === 'string')
						: [],
				])
			)
			debug(
				`Dropped ${Object.keys(json).length - keyNum} keys from ${file}`,
				'make-json'
			)

			map = { ...map, ...json }
		}

		return map
	}

	protected makeJson(
		sourceFile: string,
		destination: string,
		map: Record<string, string[]> | null
	): string[] {
		const mapping: Record<string, Translations> = {}
		const translations: Translations = Translations.fromPoFile(sourceFile)
		const result: string[] = []

		let baseFileName: string = path.basename(sourceFile, '.po')

		const domain: string | null = translations.getDomain()

		if (domain && !baseFileName.startsWith(domain)) {
			baseFileName = `${domain}-${baseFileName}`
		}

		translations.forEach((translation: Translation) => {
			const sources: string[] = (translation.getReferences() || [])
				.map((reference) => {
					const file: string = reference[0]

					if (file.endsWith('.min.js')) {
						return file.slice(0, -7) + '.js'
					}

					if (file.endsWith('.js')) {
						return file
					}

					return null
				})
				.filter(Boolean) as string[]

			const uniqueSources: string[] = Array.from(new Set(sources))

			uniqueSources.forEach((source) => {
				if (!mapping[source]) {
					mapping[source] = new Translations()

					// TODO: Uncomment once the bug is fixed.
					// See https://core.trac.wordpress.org/ticket/45441
					// mapping[source].setDomain(translations.getDomain());

					mapping[source].setHeader(
						'Language',
						translations.getLanguage() || ''
					)
					mapping[source].setHeader(
						'PO-Revision-Date',
						translations.getHeader('PO-Revision-Date') || ''
					)

					const pluralForms: [number, string] | null =
						translations.getPluralForms()
					if (pluralForms) {
						const [count, rule] = pluralForms
						mapping[source].setPluralForms(count, rule)
					}
				}

				mapping[source].append(translation)
			})
		})

		result.push(...this.buildJsonFiles(mapping, baseFileName, destination))

		return result
	}

	protected referenceMap(
		references: [string, number][],
		map: Record<string, string[]> | null
	): [string, number][] {
		if (map === null) {
			return references
		}

		const temp: string[][] = references.map(([reference, index]) => {
			const file: string = reference

			if (map[file]) {
				return map[file]
			}

			return []
		})

		const referencesResult: [string, number][] = temp
			.flat()
			.map((value): [string, number] => [value, 0])

		return referencesResult
	}

	protected buildJsonFiles(
		mapping: Record<string, Translations>,
		baseFileName: string,
		destination: string
	): string[] {
		const result: string[] = []

		for (const file of Object.keys(mapping)) {
			const translations: Translations = mapping[file]

			const hash: string = createHash('md5').update(file).digest('hex')
			const destinationFile: string = path.join(
				destination,
				`${baseFileName}-${hash}.json`
			)

			const success: boolean = PoGenerator.toFile(
				translations,
				destinationFile,
				{
					json: this.json_options,
					source: file,
				}
			)

			if (!success) {
				warning(
					`Could not create file ${path.basename(destinationFile, '.json')}`
				)
				continue
			}

			result.push(destinationFile)
		}

		return result
	}

	protected removeJsStringsFromPoFile(sourceFile: string): boolean {
		const translations: Translations = Translations.fromPoFile(sourceFile)

		translations.forEach((translation: Translation) => {
			if (!translation.getReferences()) {
				return
			}

			for (const reference of translation.getReferences()) {
				const file: string = reference[0]

				if (!file.endsWith('.js')) {
					continue
				}
			}

			delete translations.translations[translation.msgid]
		})

		return PoGenerator.toFile(translations, sourceFile)
	}
}

function parseShellArrays(
	assocArgs: Record<string, any>,
	arrayKeys: string[]
): Record<string, any> {
	// Implementation for parseShellArrays
}

function getFlagValue(
	assocArgs: Record<string, any>,
	flag: string,
	defaultValue: any
): any {
	// Implementation for getFlagValue
}

const command = new MakeJsonCommand()
command.invoke(process.argv.slice(2), {}).catch((error) => console.error(error))
