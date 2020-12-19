/// <reference types="cypress" />

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// in the user project it would be
// const mdPreprocessor = require('cypress-markdown-preprocessor')
const mdPreprocessor = require('../..')

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('file:preprocessor', mdPreprocessor)
}
