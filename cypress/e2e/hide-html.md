# Hide HTML block

<!-- fiddle HTML source not shown -->

```html hide
<div id="greeting">Hello</div>
```

```js
cy.get('div#greeting').should('have.text', 'Hello')
```

<!-- fiddle-end -->
