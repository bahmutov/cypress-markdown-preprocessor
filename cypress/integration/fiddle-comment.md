# Fiddle comment

## Single line

<!-- fiddle First -->

```js
expect(true).to.be.true
```

<!-- fiddle-end -->

## Multi line

The special fiddle comments might be multiline

<!--
  fiddle
  title: The test
-->

```js
console.log(this.currentTest)
```

<!-- fiddle-end -->

## Multi line end

<!--
  fiddle
  title: Another test
-->

```js
console.log(this.currentTest)
```

The end comment can be multiline too

<!--
fiddle-end
-->

## End with a dot

<!--
  fiddle
  title: End comment uses dot
-->

```js
console.log(this.currentTest)
```

The end comment uses `fiddle.end`

<!-- fiddle.end -->
