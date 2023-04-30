#!/usr/bin/env node
// @ts-check

const debug = require('debug')('cypress-markdown-preprocessor')
const fs = require('fs')
const arg = require('arg')
const globby = require('globby')
const { collectFiddles } = require('../src/collect-utils')

const args = arg(
  {
    '--print': Boolean, // to STDOUT
    '--filename': String, // output filename
    // aliases
    '-p': '--print',
    '-f': '--filename',
  },
  { argv: process.argv },
)
debug('arguments %o', args)

// remove "node" and the script name from the list of arguments
const markdownPattern = args._.slice(2)
const sourceFiles = globby.sync(markdownPattern)
debug('source files')
debug(sourceFiles)

if (!sourceFiles.length) {
  console.error('Could not find any Markdown files')
  process.exit(1)
}

console.log(
  'Searching for fiddles in %d Markdown file(s)',
  sourceFiles.length,
)

const fiddles = collectFiddles(sourceFiles)

console.log(
  'found %d fiddle(s) across %d Markdown file(s)',
  fiddles.length,
  sourceFiles.length,
)

if (args['--print']) {
  console.log(fiddles)
}

if (args['--filename']) {
  const text = JSON.stringify(fiddles, null, 2) + '\n'
  fs.writeFileSync(args['--filename'], text)
  console.log('write fiddles to JSON file %s', args['--filename'])
}
