#!/usr/bin/env node
// @ts-check

const debug = require('debug')('cypress-markdown-preprocessor')
const path = require('path')
const fs = require('fs')
const arg = require('arg')
const globby = require('globby')

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
console.log(
  'Searching for fiddles in %d Markdown file(s)',
  sourceFiles.length,
)
