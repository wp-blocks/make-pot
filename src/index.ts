#!/usr/bin/env node
import { makePot } from './parser/makePot'

import { getArgs } from './cliArgs'

import yargs from 'yargs'
import { pkgJson } from './const'

/** Main execution */
const args = getArgs()

if (Object.keys(args).length > 0) {
	/* print the version */
	console.log(pkgJson.name + ' version: ' + pkgJson.version)
	/* capture the start time */
	const timeStart = new Date()
	/** make the pot file */
	makePot(args)
		.then(() => {
			/* output the end time */
			const timeEnd = new Date()
			console.log(
				`🚀 Translation Pot file created in ${timeEnd.getTime() - timeStart.getTime()}ms`
			)
		})
		.catch((error) => {
			console.error(error)
		})
} else {
	/** print the help if no arguments are passed */
	yargs.showHelp()
}
