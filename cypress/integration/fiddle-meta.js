/// <reference types="cypress" />

const { stripIndent } = require('common-tags')
import { utils } from '../../src/markdown-utils'

chai.config.truncateThreshold = 1000

describe('getTestParameters', () => {
  const { getTestParameters } = utils
  it('returns the test name from single line comment', () => {
    expect(getTestParameters('First')).to.deep.equal({
      name: 'First',
      only: false,
      skip: false,
      export: false,
    })
  })
  it('returns the test name from single line comment', () => {
    expect(getTestParameters('title: First')).to.deep.equal({
      name: 'First',
      only: false,
      skip: false,
      export: false,
    })
  })

  it('trims the meta text', () => {
    const meta = '\n\n Hello there \n \n '
    expect(getTestParameters(meta)).to.deep.equal({
      name: 'Hello there',
      only: false,
      skip: false,
      export: false,
    })
  })
})
