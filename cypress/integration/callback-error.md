# Callback error

If you enable this test it fails because the `cy.stub` throws an error.

<!-- fiddle.skip Callback error -->

```html
<script>
  setTimeout(() => {
    console.log('Random error')
  }, 100)
</script>
```

```js
cy.window()
  .its('console')
  .then((console) => {
    cy.stub(console, 'log').callsFake(function (...args) {
      throw new Error('Nope')
    })
  })
cy.wait(1500)
```

<!-- fiddle-end -->
