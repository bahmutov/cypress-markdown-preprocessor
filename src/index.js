// @ts-check
const fs = require('fs')
const path = require('path')
const { source } = require('common-tags')
const tempWrite = require('temp-write')
const cyBrowserify = require('@cypress/browserify-preprocessor')()
const debug = require('debug')('cypress-markdown-preprocessor')
const mdUtils = require('./markdown-utils')

// when a temporary file is written, it is placed outside the current folder
// thus finding the "@cypress/fiddle" module using the regular Node module resolution
// is impossible. Just resolve the path once and require it directly later.
const fiddleModulePath = require.resolve('@cypress/fiddle')
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
  const md = fs.readFileSync(filePath, 'utf8')

  const createTests = mdUtils.extractFiddles(md)
  const createTestsText = JSON.stringify(createTests, null, 2)
  if (debug.enabled) {
    console.error(createTestsText)
  }

  const specSource = source`
      const { testExamples } = require('${fiddleModulePath}');
      const fiddles = ${createTestsText};
      testExamples(fiddles);
    `
  // console.log(specSource)
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
    on: file.on,
  })
}

module.exports = mdPreprocessor
