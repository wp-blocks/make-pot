#!/usr/bin/env node
import { makePot } from './makePot'

import { args } from './cliArgs'

import yargs from 'yargs'

// @ts-expect-error TS2339: Property _ does not exist on type 'yargs.Arguments'.
const options = (args ?? {})?._ as Record<string, string>

// Main execution
if (Object.keys(options).length > 0) {
  makePot(options)
} else {
  yargs.showHelp()
}
