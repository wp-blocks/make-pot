import yargs from "yargs";
import {hideBin} from 'yargs/helpers'

export const args = yargs(hideBin(process.argv))
  .usage('Usage: $0 <source> [destination] [options]')
  .option('slug', {
    describe: 'Plugin or theme slug',
    type: 'string'
  })
  .option('domain', {
    describe: 'Text domain to look for in the source code',
    type: 'string'
  })
  .option('skip-js', {
    describe: 'Skip JavaScript files',
    type: 'boolean'
  })
  .option('skip-php', {
    describe: 'Skip PHP files',
    type: 'boolean'
  })
  .option('skip-blade', {
    describe: 'Skip Blade files',
    type: 'boolean'
  })
  .option('skip-block-json', {
    describe: 'Skip block.json files',
    type: 'boolean'
  })
  .option('skip-theme-json', {
    describe: 'Skip theme.json files',
    type: 'boolean'
  })
  .option('skip-audit', {
    describe: 'Skip auditing of strings',
    type: 'boolean'
  })
  .option('headers', {
    describe: 'Headers',
    type: 'string'
  })
  .option('file-comment', {
    describe: 'File comment',
    type: 'string'
  })
  .option('package-name', {
    describe: 'Package name',
    type: 'string'
  })
  .option('location', {
    describe: 'Include location information',
    type: 'boolean'
  })
  .option('ignore-domain', {
    describe: 'Ignore text domain',
    type: 'boolean'
  })
  .option('merge', {
    describe: 'Merge with existing POT file(s)',
    type: 'string'
  })
  .option('subtract', {
    describe: 'Subtract strings from existing POT file(s)',
    type: 'string'
  })
  .option('subtract-and-merge', {
    describe: 'Subtract and merge strings from existing POT file(s)',
    type: 'boolean'
  })
  .option('include', {
    describe: 'Include specific files',
    type: 'string'
  })
  .option('exclude', {
    describe: 'Exclude specific files',
    type: 'string'
  })
  .help('h')
  .alias('h', 'help')
  .argv
