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
  })

  it('detects fiddle start comments', () => {
    const regex = /<!--\s+fiddle\s+/g
    let match
    let matchCount = 0
    let fiddles = []
    do {
      match = regex.exec(fiddleCommentMarkdown)
      if (match) {
        // console.log(match)
        matchCount += 1

        // remove the start of the comment
        const start = fiddleCommentMarkdown.indexOf(
          'fiddle',
          match.index,
        )

        // find the end of the HTML comment
        const endComment = '-->'
        const endCommentIndex = fiddleCommentMarkdown.indexOf(
          endComment,
          start,
        )
        const fiddleComment = fiddleCommentMarkdown
          .substring(
            start + 6, // where the word "fiddle" was found + 6 characters
            endCommentIndex,
          )
          .trim()
        // console.log(fiddleComment)
        fiddles.push(fiddleComment)
      }
    } while (match)
    expect(matchCount).to.equal(4)
    expect(fiddles).to.deep.equal([
      'First',
      'title: The test',
      'title: Another test',
      'title: End comment uses dot',
    ])
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
