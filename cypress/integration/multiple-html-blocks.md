# Multiple HTML code blocks

<!-- fiddle Multiple HTML code blocks -->

```html
<div id="greeting">Hello</div>
```

Another HTML code block

```html
<div id="name">World</div>
```

```js
cy.get('div#greeting').should('have.text', 'Hello')
cy.get('div#name').should('have.text', 'World')
```

<!-- fiddle-end -->
