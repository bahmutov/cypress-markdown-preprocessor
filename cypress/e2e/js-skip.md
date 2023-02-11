# Skips JS block

<!-- fiddle Two JS blocks -->

This HTML block is ignored

```html skip
<div>This HTML does not run</div>
<script>
  throw new Error('Should skip HTML block')
</script>
```

The first JS block should be ignored

```js skip
// THIS JavaScript WILL BE SKIPPED
// and not included in the extracted fiddle
expect(false).to.be.true
```

```js
// this JS block will run
expect(42).to.equal(42)
```

<!-- fiddle.end -->
