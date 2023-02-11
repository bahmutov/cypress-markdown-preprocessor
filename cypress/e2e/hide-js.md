# Hide JavaScript block

<!-- fiddle JavaScript source not shown -->

```html
<div id="greeting">Hello</div>
```

```js hide
cy.get('div#greeting').should('have.text', 'Hello')
```

<!-- fiddle-end -->
