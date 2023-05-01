#!/usr/bin/env node
// @ts-check

const debug = require('debug')('cypress-markdown-preprocessor')
const fs = require('fs')
const arg = require('arg')
const globby = require('globby')
const { collectFiddlesIn } = require('../src/collect-utils')

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
collectFiddlesIn(markdownPattern)
  .then((fiddles) => {
    console.log(
      'found %d fiddle(s) across Markdown file(s)',
      fiddles.length,
    )

    if (args['--print']) {
      console.log(fiddles)
    }

    if (args['--filename']) {
      const text = JSON.stringify(fiddles, null, 2) + '\n'
      fs.writeFileSync(args['--filename'], text)
      console.log('write fiddles to JSON file %s', args['--filename'])
    }
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
