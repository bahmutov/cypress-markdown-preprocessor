// @ts-check
const fs = require('fs')
const path = require('path')
const { source } = require('common-tags')
const tempWrite = require('temp-write')
const chokidar = require('chokidar')
const cyBrowserify = require('@cypress/browserify-preprocessor')()
const debug = require('debug')('cypress-markdown-preprocessor')
const verbose = require('debug')(
  'cypress-markdown-preprocessor:verbose',
)
const mdUtils = require('./markdown-utils')

// when a temporary file is written, it is placed outside the current folder
// thus finding the "@bahmutov/cypress-fiddle" module using the regular Node module resolution
// is impossible. Just resolve the path once and require it directly later.
const fiddleModulePath = require.resolve('@bahmutov/cypress-fiddle')

// bundled[filename] => promise
const bundled = {}

const bundleMdFile = (filePath, outputPath) => {
  const md = fs.readFileSync(filePath, 'utf8')

  const createTests = mdUtils.extractFiddles(md)
  const createTestsText = JSON.stringify(createTests, null, 2)

  if (verbose.enabled) {
    console.error(createTestsText)
  }

  const specSource = source`
    const { testExamples } = require('${fiddleModulePath}');
    const fiddles = ${createTestsText};
    testExamples(fiddles);
  `
  const writtenTempFilename = tempWrite.sync(
    specSource,
    path.basename(filePath) + '.js',
  )
  debug('wrote temp file', writtenTempFilename)

  return cyBrowserify({
    filePath: writtenTempFilename,
    outputPath,
    // since the file is generated once, no need to watch it
    shouldWatch: false,
    on: () => {},
  })
}

/**
  Parses Markdown file looking for special fiddle comments. If found,
  creates separate tests from them. If processing ".js" or ".coffee" files just
  calls Cypress Browserify preprocessor.

  ```
  const mdPreprocessor = require('cypress-markdown-preprocessor')
  module.exports = (on, config) => {
    on('file:preprocessor', mdPreprocessor)
  }
  ```
*/
const mdPreprocessor = (file) => {
  const { filePath, outputPath, shouldWatch } = file

  if (filePath.endsWith('.js') || filePath.endsWith('.coffee')) {
    return cyBrowserify(file)
  }

  debug({ filePath, outputPath, shouldWatch })

  if (bundled[filePath]) {
    debug('already have bundle promise for file %s', filePath)
    return bundled[filePath]
  }

  if (shouldWatch) {
    debug('watching the file %s', filePath)

    // start bundling the first time
    bundled[filePath] = bundleMdFile(filePath, outputPath)

    // and start watching the input Markdown file
    const watcher = chokidar.watch(filePath)
    watcher.on('change', () => {
      // if the Markdown file changes, we want to rebundle it
      // and tell the Test Runner to run the tests again
      debug('file %s has changed', filePath)
      bundled[filePath] = bundleMdFile(filePath, outputPath)
      bundled[filePath].then(() => {
        debug('finished bundling, emit rerun')
        file.emit('rerun')
      })
    })

    // when the test runner closes this spec
    file.on('close', () => {
      debug('file %s close, removing bundle promise', filePath)
      delete bundled[filePath]
      watcher.close()
    })

    return bundled[filePath]
  }

  // non-interactive mode
  bundled[filePath] = bundleMdFile(filePath, outputPath)
  return bundled[filePath]
}

module.exports = mdPreprocessor
