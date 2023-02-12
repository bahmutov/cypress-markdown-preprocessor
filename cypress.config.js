const { defineConfig } = require('cypress')
// https://github.com/bahmutov/cypress-split
const cypressSplit = require('cypress-split')

// in the user project it would be
// const mdPreprocessor = require('cypress-markdown-preprocessor')
const mdPreprocessor = require('.')

module.exports = defineConfig({
  fixturesFolder: false,
  viewportWidth: 500,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      cypressSplit(on, config)
      on('file:preprocessor', mdPreprocessor)
      return config
    },
    specPattern: ['cypress/e2e/*.md', 'cypress/e2e/*.js'],
    excludeSpecPattern: ['skip.js'],
  },
})
