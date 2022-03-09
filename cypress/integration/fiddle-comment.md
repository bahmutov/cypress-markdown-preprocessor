# Fiddle comment

## Single line

<!-- fiddle First -->

```js
console.log('1')
```

<!-- fiddle-end -->

## Multi line

The special fiddle comments might be multiline

<!--
  fiddle
  title: The test
-->

```js
console.log('2')
```

<!-- fiddle-end -->

## Multi line end

<!--
  fiddle
  title: Another test
-->

```js
console.log('3')
```

The end comment can be multiline too

<!--
fiddle-end
-->

## End with a dot

<!--
  fiddle
  title: End comment uses dot
  skip: true
-->

```js
console.log('4')
```

The end comment uses `fiddle.end`

<!-- fiddle.end -->
