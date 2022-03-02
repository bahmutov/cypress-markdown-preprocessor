/// <reference types="cypress" />

import { extractFiddles } from '../../src/markdown-utils'

chai.config.truncateThreshold = 1000

describe('extractFiddles', () => {
  /** @type {string} */
  let fiddleCommentMarkdown

  before(() => {
    cy.readFile('cypress/integration/fiddle-comment.md').then(
      (md) => (fiddleCommentMarkdown = md),
    )
  })

  it('grabs all matches in a string', () => {
    const regex = /a/g
    const text = 'start a middle a end'
    let match
    do {
      match = regex.exec(text)
      if (match) {
        console.log(match)
      }
    } while (match)
    // const matches = text.match(regex)
    // console.log(matches)
    // for (let match in matches) {
    //   console.log(match)
    // }
  })

  it('detects fiddle start comments', () => {
    const regex = /<!--\s+fiddle\s+/g
    let match
    do {
      match = regex.exec(fiddleCommentMarkdown)
      if (match) {
        console.log(match)
      }
    } while (match)
  })

  it('finds a fiddle', () => {
    const fiddles = extractFiddles(fiddleCommentMarkdown)
    expect(fiddles).to.deep.equal({
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
