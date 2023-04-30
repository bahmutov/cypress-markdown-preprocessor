const debug = require('debug')('cypress-markdown-preprocessor')
const mdUtils = require('../src/markdown-utils')
const fs = require('fs')
const globby = require('globby')

function collectFiddles(sourceFiles) {
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
          const fullTitle = parentTitle
            ? parentTitle + ' ' + key
            : key
          const t = tests[key]
          collectTests(t, fullTitle)
        })
      }
    }

    collectTests(treeOfTests)
    const n = fiddles.length - startNumber
    debug('found %d fiddles in %s', n, markdownFilename)
  })
  return fiddles
}

/**
 * Finds all fiddles in the given wildcard or list of files
 * @param {string|string[]} markdownFilePattern
 */
function collectFiddlesIn(markdownFilePattern) {
  const sourceFiles = globby.sync(markdownFilePattern)
  debug('source files')
  debug(sourceFiles)

  if (!sourceFiles.length) {
    throw new Error('Could not find any Markdown files')
  }

  console.log(
    'Searching for fiddles in %d Markdown file(s)',
    sourceFiles.length,
  )

  return collectFiddles(sourceFiles)
}

module.exports = { collectFiddles, collectFiddlesIn }
