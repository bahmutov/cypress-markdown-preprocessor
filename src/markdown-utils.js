// @ts-check
const { parse } = require('@textlint/markdown-to-ast')
const debug = require('debug')('cypress-markdown-preprocessor')
const verbose = require('debug')(
  'cypress-markdown-preprocessor:verbose',
)

function stripQuotes(s) {
  return s.replace(/^['"]|['"]$/g, '')
}

/**
 * Finds optional fiddle name from the comment line
 * `<!-- fiddle my name -->` returns "my name".
 */
const findFiddleName = (commentLine) => {
  debug('finding fiddle name from line: "%s"', commentLine)
  const matches = /fiddle(?:\.only|\.skip|\.export)? (.+)-->/.exec(
    commentLine,
  )
  if (matches && matches.length) {
    const testTitle = matches[1].trim()
    debug('test title: "%s"', testTitle)
    return testTitle
  } else {
    debug('could not fiddle name from line "%s"', commentLine)
  }
}

const isFiddleOnly = (line) => line.startsWith('<!-- fiddle.only ')
const isFiddleSkip = (line) => line.startsWith('<!-- fiddle.skip ')
const isFiddleExport = (line) =>
  line.startsWith('<!-- fiddle.export ')

const isFiddleMarkup = (s) => s && s.startsWith('<!-- fiddle-markup')

const extractFiddleMarkup = (s) => {
  s = s.replace('<!-- fiddle-markup', '').replace('-->', '').trim()
  return s
}

const isMoreThanAComment = (s) => {
  if (!s) {
    return false
  }

  const trimmed = s.trim()
  return !(
    trimmed.startsWith('<!--') &&
    trimmed.endsWith('-->') &&
    trimmed.length > 9
  )
}

/**
 * Checks if the given line starts with "<!-- fiddle" or one of its variations.
 */
const isFiddleStartLine = (line) => {
  return (
    line.startsWith('<!-- fiddle ') ||
    isFiddleOnly(line) ||
    isFiddleSkip(line) ||
    isFiddleExport(line)
  )
}

function formFiddleObject(options) {
  const nameSeparator = '/'
  const separatorAt = options.name.indexOf(nameSeparator)
  if (separatorAt === -1) {
    return options
  }

  const suiteName = options.name.substr(0, separatorAt).trim()
  const restName = options.name.substr(separatorAt + 1).trim()
  return {
    [suiteName]: [
      formFiddleObject({
        ...options,
        name: restName,
      }),
    ],
  }
}

function extractFiddles2(fiddleCommentMarkdown) {
  const fiddles = []

  const regex = /<!--\s*fiddle\s+/g
  let match
  do {
    match = regex.exec(fiddleCommentMarkdown)
    if (match) {
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
      const endFiddleRegex = /<!--\s*fiddle[-.]end\s*-->/
      const endMatch = endFiddleRegex.exec(afterStartComment)
      if (endMatch) {
        const fiddleBody = afterStartComment
          .slice(0, endMatch.index)
          .trim()

        const newFiddle = {
          meta: fiddleComment,
        }
        if (fiddleBody) {
          newFiddle.fiddle = fiddleBody
        }
        fiddles.push(newFiddle)
      }
    }
  } while (match)

  return fiddles
}

/**
 * Extracts the test parameters from the fiddle beginning HTML comment.
 * @param {string} meta The fiddle HTML comment text
 */
function getTestParameters(meta) {
  if (typeof meta !== 'string') {
    throw new Error(
      'getTestParameters() expects a string as the first argument',
    )
  }
  meta = meta.trim()
  if (!meta) {
    return {
      only: false,
      skip: false,
      export: false,
    }
  }

  function isMultiline(text) {
    return text.includes('\n')
  }
  function getTestName(line) {
    if (/^\s*title\s*:/i.test(line)) {
      return line.replace(/^\s*title\s*:/i, '').trim()
    }
  }

  let name
  let skip = false
  let only = false
  let exportFiddle = false

  const lines = meta
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  lines.forEach((line) => {
    if (line.match(/title:/)) {
      name = line.split('title:')[1].trim()
    } else if (line.match(/skip:/)) {
      skip = line.split('skip:')[1].trim() === 'true'
    } else if (line.match(/only:/)) {
      only = line.split('only:')[1].trim() === 'true'
    } else if (line.match(/export:/)) {
      exportFiddle = line.split('export:')[1].trim() === 'true'
    } else {
      // probably the fiddle name
      name = line.trim()
    }
  })

  if (name) {
    name = stripQuotes(name)
  }

  const info = {
    only,
    skip,
    export: exportFiddle,
  }
  if (name) {
    info.name = name
  }
  return info
}

function extractFiddles(md) {
  const lines = md.split('\n')
  const fiddles = []

  let pageTitle
  const titleLine = lines.find((line) => line.startsWith('# '))
  if (titleLine) {
    const matches = /^# (.+)$/.exec(titleLine)
    if (matches && matches.length) {
      pageTitle = matches[1].trim()
      debug('page title "%s"', pageTitle)
    }
  }

  let start = 0
  let startLine
  do {
    debug('start with %d', start)
    start = lines.findIndex(
      (line, k) => k >= start && isFiddleStartLine(line),
    )
    if (start === -1) {
      break
    }

    startLine = lines[start]
    const defaultFiddleName = `fiddle at line ${start + 1}`
    const testName = findFiddleName(startLine) || defaultFiddleName

    // allow ending fiddle with both comment lines
    let end = lines.indexOf('<!-- fiddle-end -->', start)
    if (end === -1) {
      end = lines.indexOf('<!-- fiddle.end -->', start)
    }
    if (end === -1) {
      console.error('could not find where fiddle "%s" ends', testName)
      console.error('did you forget "<!-- fiddle-end -->"?')
      break
    }

    const fiddle = lines.slice(start + 1, end).join('\n')

    fiddles.push({
      name: testName,
      fiddle,
      only: isFiddleOnly(startLine),
      skip: isFiddleSkip(startLine),
      export: isFiddleExport(startLine),
    })

    start = end + 1
  } while (true)

  debug('found %d fiddles', fiddles.length)
  verbose(fiddles)
  // list of fiddles converted into JavaScript
  const testFiddles = []

  const shouldIncludeBlock = (block) => {
    if (!block.meta) {
      return true
    }
    return !block.meta.includes('skip')
  }

  const isHtmlCodeBlock = (n) =>
    n.type === 'CodeBlock' && n.lang === 'html'
  const isLiveHtml = (n) => n.type === 'Html'
  const isJavaScript = (n) =>
    n.type === 'CodeBlock' &&
    (n.lang === 'js' || n.lang === 'javascript')
  const isCssCodeBlock = (n) =>
    n.type === 'CodeBlock' && n.lang === 'css'

  fiddles.forEach((fiddle) => {
    const ast = parse(fiddle.fiddle)
    // console.log('markdown fiddle AST')
    // console.log(ast)

    const cssMaybe = ast.children
      .filter(isCssCodeBlock)
      .filter(shouldIncludeBlock)
      .map((codeBlock) => codeBlock.value)
      .join('\n')
    // console.log(cssMaybe)

    const htmlMaybe = ast.children
      .filter(isHtmlCodeBlock)
      .filter(shouldIncludeBlock)
      .map((htmlCodeBlock) => {
        const meta = htmlCodeBlock.meta || ''
        return {
          source: htmlCodeBlock.value,
          hide: meta.includes('hide'),
        }
      })
    // console.log('html maybe')
    // console.log(htmlMaybe)

    const htmlLiveBlockMaybe = ast.children.find(
      (s) =>
        isMoreThanAComment(s.value) &&
        isLiveHtml(s) &&
        !isFiddleMarkup(s.value) &&
        shouldIncludeBlock(s),
    )
    // console.log('html live block')
    // console.log(htmlLiveBlockMaybe)

    const htmlMarkup = ast.children.find((s) =>
      isFiddleMarkup(s.value),
    )

    // console.log('found html block?', htmlMaybe)

    // a single fiddle can have multiple JS blocks
    // we want to find them all and merge into a single test
    const jsMaybe = ast.children
      .filter(isJavaScript)
      .filter(shouldIncludeBlock)
      .map((codeBlock) => {
        const meta = codeBlock.meta || ''
        return {
          source: codeBlock.value,
          hide: meta.includes('hide'),
        }
      })

    if (jsMaybe.length) {
      // console.log(jsMaybe)
      const testCode = jsMaybe.map((b) => b.source).join('\n')
      const testCodeShow = jsMaybe
        .filter((b) => !b.hide)
        .map((b) => b.source)
        .join('\n')

      const commonHtml = htmlMarkup
        ? extractFiddleMarkup(htmlMarkup.value)
        : null

      const testFiddle = formFiddleObject({
        name: fiddle.name,
        test: testCode,
        testShown: testCodeShow || null,
        html: htmlLiveBlockMaybe
          ? htmlLiveBlockMaybe.value
          : htmlMaybe.length
          ? htmlMaybe
          : null,
        commonHtml,
        css: cssMaybe || null,
        only: fiddle.only,
        skip: fiddle.skip,
        export: fiddle.export,
      })
      if (verbose.enabled) {
        debug('test fiddle formed from "%s"', fiddle.name)
        console.error(testFiddle)
      }

      testFiddles.push(testFiddle)
    }
  })

  // console.log(testFiddles)
  debug('Found fiddles: %d', testFiddles.length)
  if (verbose.enabled) {
    console.error(testFiddles)
  }

  // merging top level fiddles, so that
  // fiddles "parent / this" and "parent / that"
  // end up in a single describe "parent"
  const merged = []
  const mergedLists = {}

  testFiddles.forEach((t) => {
    if (Object.keys(t).length !== 1) {
      merged.push(t)
      return
    }

    const name = Object.keys(t)[0]
    if (!Array.isArray(t[name])) {
      merged.push(t)
      return
    }

    if (mergedLists[name]) {
      mergedLists[name].push(...t[name])
    } else {
      mergedLists[name] = t[name]
      merged.push(t)
    }
  })
  if (verbose.enabled) {
    verbose('merged fiddles')
    console.error(merged)
  }

  const createTests = pageTitle
    ? {
        [pageTitle]: merged,
      }
    : merged

  return createTests
}

module.exports = {
  extractFiddles,
  extractFiddles2,
  utils: {
    getTestParameters,
    stripQuotes,
  },
}
