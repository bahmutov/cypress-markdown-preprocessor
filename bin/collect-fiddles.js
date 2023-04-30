#!/usr/bin/env node
// @ts-check

const debug = require('debug')('cypress-markdown-preprocessor')
const mdUtils = require('../src/markdown-utils')
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

if (!sourceFiles.length) {
  console.error('Could not find any Markdown files')
  process.exit(1)
}

console.log(
  'Searching for fiddles in %d Markdown file(s)',
  sourceFiles.length,
)

const fiddles = []
sourceFiles.forEach((markdownFilename, k) => {
  const stats = fs.statSync(markdownFilename)
  const md = fs.readFileSync(markdownFilename, 'utf8')
  const treeOfTests = mdUtils.extractFiddles(md)
  // debug(treeOfTests)

  let startNumber = fiddles.length
  const collectTests = (tests, parentTitle) => {
    if (tests.name) {
      // already a test object
      const fullTitle = parentTitle
        ? parentTitle + ' ' + tests.name
        : tests.name
      fiddles.push({
        title: fullTitle,
        filename: markdownFilename,
        created: stats.birthtime,
        modified: stats.mtime,
      })
      return
    }

    if (Array.isArray(tests)) {
      tests.forEach((test) => {
        collectTests(test, parentTitle)
      })
    } else {
      Object.keys(tests).forEach((key) => {
        const fullTitle = parentTitle ? parentTitle + ' ' + key : key
        const t = tests[key]
        collectTests(t, fullTitle)
      })
    }
  }

  collectTests(treeOfTests)
  const n = fiddles.length - startNumber
  debug('found %d fiddles in %s', n, markdownFilename)
})
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
