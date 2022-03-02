/// <reference types="cypress" />

import { extractFiddles } from '../../src/markdown-utils'

chai.config.truncateThreshold = 1000

describe('extractFiddles', () => {
  it('finds a fiddle', () => {
    cy.readFile('cypress/integration/fiddle-comment.md')
      .then(extractFiddles)
      .should('deep.equal', {
        'Fiddle comment': [
          {
            name: 'First',
            test: 'expect(true).to.be.true',
            html: null,
            commonHtml: null,
            only: false,
            skip: false,
            export: false,
          },
        ],
      })
  })
})
