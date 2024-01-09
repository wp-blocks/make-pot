#!/usr/bin/env node
import { makePot } from './makePot'

import { args } from './handleArgs'

import yargs from 'yargs'

// @ts-ignore
const options = (args ?? {})?._ as Record<string, string>

// Main execution
if (Object.keys(options).length > 0) {
  makePot(options)
} else {
  yargs.showHelp()
}
