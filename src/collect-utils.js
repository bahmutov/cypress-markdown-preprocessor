const debug = require('debug')('cypress-markdown-preprocessor')
const mdUtils = require('../src/markdown-utils')
const fs = require('fs')

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

module.exports = { collectFiddles }
