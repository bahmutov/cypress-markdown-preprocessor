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

  it('grabs the skip flag', () => {
    const meta = stripIndent`
      fiddle
      title: End comment uses dot
      skip: true
    `
    const info = getTestParameters(meta)
    expect(info).to.deep.equal({
      name: 'End comment uses dot',
      only: false,
      skip: true,
      export: false,
    })
  })

  it('grabs the skip and only flags', () => {
    const meta = stripIndent`
      fiddle
      title: End comment uses dot
      only: true
      skip: true
    `
    const info = getTestParameters(meta)
    expect(info).to.deep.equal({
      name: 'End comment uses dot',
      only: true,
      skip: true,
      export: false,
    })
  })

  it('handles no title', () => {
    const meta = stripIndent`
      only: true
      skip: true
    `
    const info = getTestParameters(meta)
    expect(info).to.deep.equal({
      only: true,
      skip: true,
      export: false,
    })
  })
})
