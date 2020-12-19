# Cypress Markdown spec

<!-- fiddle Example -->
```html
<div id="parent">
  <div id="first">A new div will appear in 2 seconds</div>
</div>
<script>
  setTimeout(() => {
    const div = document.getElementById('parent')
    const newDiv = document.createElement('second')
    newDiv.textContent = 'second div'
    newDiv.id = 'second'
    div.appendChild(newDiv)
  }, 2000)
</script>
```

```js
cy.get('#first').should('be.visible')
cy.get('#second').should('have.text', 'second div')
```
<!-- fiddle.end -->
