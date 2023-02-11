# Testing require

A fiddle can require 3rd party modules

<!-- SKIP https://github.com/bahmutov/cypress-markdown-preprocessor/issues/78 -->
<!-- fiddle.skip Map and its functions -->

```js
const { map, its } = require('cypress-should-really')
const getEachName = map(its('name'))
const people = [{ name: 'joe' }, { name: 'mary' }]
const names = getEachNames(people)
expect(names).to.deep.equal(['joe', 'mary'])
```

<!-- fiddle.end -->
