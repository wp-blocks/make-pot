#!/usr/bin/env node
import { makePot } from './makePot'

import { getArgs } from './cliArgs'

import yargs from 'yargs'

import { name, version } from '../package.json'

/** Main execution */
const args = getArgs()
if (Object.keys(args).length > 0) {
	console.log(name + ' version: ' + version)
	const timeStart = new Date()
	makePot(args)
		.then(() => {
			const timeEnd = new Date()
			console.log(
				`🚀 Translation Pot file created in ${timeEnd.getTime() - timeStart.getTime()}ms`
			)
		})
		.catch((error) => {
			console.error(error)
		})
} else {
	yargs.showHelp()
}
