# Testing imports

A fiddle can have 3rd party imports on a single line

<!-- SKIP https://github.com/bahmutov/cypress-markdown-preprocessor/issues/77 -->
<!-- fiddle.skip Map and its functions -->

```js
import { map, its } from 'cypress-should-really'
const getEachName = map(its('name'))
const people = [{ name: 'joe' }, { name: 'mary' }]
const names = getEachNames(people)
expect(names).to.deep.equal(['joe', 'mary'])
```

<!-- fiddle.end -->
