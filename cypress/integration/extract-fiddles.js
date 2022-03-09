// @ts-check
/// <reference types="cypress" />

const { stripIndent } = require('common-tags')
import { extractFiddles } from '../../src/markdown-utils'

chai.config.truncateThreshold = 1000

/** @type {string} */
let fiddleCommentMarkdown

before(() => {
  cy.readFile('cypress/integration/fiddle-comment.md').then(
    (md) => (fiddleCommentMarkdown = md),
  )
})

describe('extractFiddles', () => {
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
    let fiddleComments = []
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

        // find the end of the fiddle
        const afterStartComment = fiddleCommentMarkdown
          .slice(endCommentIndex)
          .replace('-->', '')
        const endFiddleRegex = /<!--\s+fiddle[-.]end\s+-->/
        const endMatch = endFiddleRegex.exec(afterStartComment)
        if (endMatch) {
          const fiddleBody = afterStartComment
            .slice(0, endMatch.index)
            .trim()
          fiddleComments.push(fiddleComment)
          fiddles.push(fiddleBody)
        }
      }
    } while (match)
    expect(matchCount).to.equal(4)
    expect(fiddleComments, 'fiddle opening comments').to.deep.equal([
      'First',
      'title: The test',
      'title: Another test',
      'title: End comment uses dot\n  skip: true',
    ])
    expect(fiddles, 'number of fiddles').to.have.length(4)
    const expectedFiddles = [
      stripIndent`
        \`\`\`js
        console.log('1')
        \`\`\`
      `,
      stripIndent`
        \`\`\`js
        console.log('2')
        \`\`\`
      `,
      stripIndent`
        \`\`\`js
        console.log('3')
        \`\`\`

        The end comment can be multiline too
      `,
      stripIndent`
        \`\`\`js
        console.log('4')
        \`\`\`

        The end comment uses \`fiddle.end\`
      `,
    ]
    console.log(fiddles)
    fiddles.forEach((fiddle, k) => {
      expect(fiddle, `fiddle ${k}`).to.equal(expectedFiddles[k])
    })
  })

  it('finds a fiddle', () => {
    const fiddles = extractFiddles(fiddleCommentMarkdown)
    expect(fiddles).to.deep.equal({
      'Fiddle comment': [
        {
          name: 'First',
          test: "console.log('1')",
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
