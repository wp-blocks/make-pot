import * as path from 'path'
import * as fs from 'fs'
import gettextParser from 'gettext-parser'
// Import your utility functions
import { createHash } from 'node:crypto'
import { glob } from 'glob'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const json_options: number[] = 0

function JsonArgs() {
	const args = yargs(hideBin(process.argv))
		.help('h')
		.alias('help', 'help')
		.usage('Usage: $0 <source> [destination] [options]')
		.options({
			purge: {
				describe: 'Purge existing JSON files',
				type: 'boolean',
			},
			'update-mo-files': {
				describe: 'Update existing MO files',
				type: 'boolean',
			},
			'use-map': {
				describe: 'Use the map file',
				type: 'boolean',
			},
			'pretty-print': {
				describe: 'Output json in pretty format',
				type: 'boolean',
			},
		})
		.parseSync()

	return {
		purge: args.purge ?? false,
		updateMoFiles: args['update-mo-files'] ?? false,
		useMap: args['use-map'] ?? false,
		prettyPrint: args['pretty-print'] ?? false,
	}
}

/**
 * Asynchronously invokes the function with the given arguments and associated arguments.
 *
 * @param {string[]} args - an array of string arguments
 * @return {Promise<void>} - a promise that resolves to void
 */
async function invoke(args: string[]): Promise<void> {
	const assocArgs = JsonArgs()

	const source: string = path.resolve(args[0])

	if (
		!source ||
		!fs.existsSync(source) ||
		(!fs.statSync(source).isFile() && !fs.statSync(source).isDirectory())
	) {
		throw new Error('Source file or directory does not exist!')
	}

	let destination: string = fs.statSync(source).isFile()
		? path.dirname(source)
		: source

	if (args[1]) {
		destination = args[1]
	}

	const map: Record<string, string[]> | null = buildMap(assocArgs.useMap)
	if (map && Object.keys(map).length === 0) {
		throw new Error('No valid keys found. No file was created.')
	}

	// Two fs.existsSync() checks in case of a race condition.
	if (
		!fs.existsSync(destination) &&
		!fs.mkdirSync(destination, { recursive: true }) &&
		!fs.existsSync(destination)
	) {
		throw new Error('Could not create destination directory!')
	}

	let resultCount: number = 0

	const files: string[] = fs.statSync(source).isFile()
		? [source]
		: glob(path.join(source, '**/*.po'))

	for (const file of files) {
		if (
			fs.statSync(file).isFile() &&
			fs.statSync(file) &&
			path.extname(file) === '.po'
		) {
			const result: string[] = makeJson(file, destination, map)
			resultCount += result.length

			if (assocArgs.purge) {
				const removed: boolean = removeJsStringsFromPoFile(file)

				if (!removed) {
					console.warn(
						`Could not update file ${path.basename(source)}`
					)
					continue
				}

				if (assocArgs.updateMoFiles) {
					const fileBasename: string = path.basename(file, '.po')
					const destinationFile: string = path.join(
						destination,
						`${fileBasename}.mo`
					)

					const translations = gettextParser.po.parse(file)
					if (translations) {
						const mo = gettextParser.mo.compile(translations)
						console.log(
							`Writing ${mo.length} bytes to ${destinationFile}`
						)
						console.log(mo)
						console.warn(`Could not create file ${destinationFile}`)
					}
				}
			}
		}
	}

	console.log(
		`Created ${resultCount} ${resultCount === 1 ? 'file' : 'files'}.`
	)
}

function buildMap(
	pathsOrMaps: string | string[] | null
): Record<string, string[]> | null {
	if (pathsOrMaps === null) {
		return null
	}

	let map: Record<string, string[]> = {}

	if (
		!Array.isArray(pathsOrMaps) ||
		pathsOrMaps.some((key) => typeof key !== 'number')
	) {
		pathsOrMaps = [pathsOrMaps] as string[]
	}

	const paths: string[] = pathsOrMaps
		? pathsOrMaps.filter((key): key is string => typeof key === 'string')
		: []
	console.log(
		`Using ${paths.length} map files: ${paths.join(', ')}`,
		'make-json'
	)

	const maps = pathsOrMaps.filter((key) => typeof key === 'object')
	console.log(`Using ${maps.length} inline map objects`, 'make-json')
	console.log(
		`Dropping ${pathsOrMaps.length - paths.length - maps.length} invalid values from map argument`,
		'make-json'
	)

	const toTransform = maps.map((value, index) => [
		value,
		`inline object ${index}`,
	])

	for (const mapPath of paths) {
		if (!fs.existsSync(mapPath) || fs.statSync(mapPath).isDirectory()) {
			console.error(`Map file ${mapPath} does not exist`)
			continue
		}

		const json = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
		if (!json || typeof json !== 'object') {
			console.warn(`Map file ${mapPath} invalid`)
			continue
		}

		toTransform.push([json, mapPath])
	}

	for (const transform of toTransform) {
		const [json, file] = transform
		const keyNum: number = Object.keys(json).length
		// normalize contents to string[]
		const newJson = Object.fromEntries(
			Object.entries(json).map(([key, value]) => [
				key,
				Array.isArray(value)
					? value.filter((v) => typeof v === 'string')
					: [],
			])
		)
		console.log(
			`Dropped ${Object.keys(newJson).length - keyNum} keys from ${file}`,
			'make-json'
		)

		map = { ...map, ...newJson }
	}

	return map
}

/**
 * Generates a JSON file based on the provided source file, destination, and map.
 *
 * @param {string} sourceFile - The path to the source file.
 * @param {string} destination - The path to the destination file.
 * @param {Record<string, string[]>} map - The map to use.
 * @return {string[]} An array of strings representing the result.
 */
function makeJson(
	sourceFile: string,
	destination: string,
	map: Record<string, string[]>
): string[] {
	const mapping = map || {}
	const translations = gettextParser.po.parse(fs.readFileSync(sourceFile))
	const result: string[] = []

	let baseFileName: string = path.basename(sourceFile, '.po')

	const domain: string | null = translations.headers['domain']

	if (domain && !baseFileName.startsWith(domain)) {
		baseFileName = `${domain}-${baseFileName}`
	}

	Object.entries(translations.translations).forEach((translation) => {
		const [key, value] = translation
		const file: string = value.getReferences()[0]

		if (!file) {
			return
		}
	})

	result.push(...buildJsonFiles(mapping, baseFileName, destination))

	return result
}

/**
 * Builds JSON files based on the provided mapping.
 *
 * @param {Record<string, any>} mapping - The mapping of files to translations.
 * @param {string} baseFileName - The base name for the destination files.
 * @param {string} destination - The destination directory for the created files.
 * @return {string[]} An array of file paths for the created JSON files.
 */
function buildJsonFiles(
	mapping: Record<string, unknown>,
	baseFileName: string,
	destination: string
): string[] {
	const result: string[] = []

	for (const file of Object.keys(mapping)) {
		const translations = mapping[file]

		const hash: string = createHash('md5').update(file).digest('hex')
		const destinationFile: string = path.join(
			destination,
			`${baseFileName}-${hash}.json`
		)

		const compiled = gettextParser.po.compile(translations, {
			json: json_options,
			source: file,
		})

		if (compiled) {
			console.log(`Writing ${path.basename(destinationFile, '.json')}`)
			console.log(compiled)
		} else {
			throw new Error(
				`Could not create file ${path.basename(destinationFile, '.json')}`
			)
		}

		result.push(destinationFile)
	}

	return result
}

function removeJsStringsFromPoFile(sourceFile: string): boolean {
	const gettext = gettextParser.po.parse(sourceFile)

	Object.entries(gettext.translations).forEach(([key, translation]) => {
		if (!translation[1]) {
			return
		}

		for (const t in translation[1]) {
			if (!t.endsWith('.js')) {
				continue
			}
		}

		delete gettext.translations[key]
	})

	return gettextParser.po.compile(gettext)
}

invoke(process.argv).catch((error) => console.error(error))
