# Hide JavaScript block

<!-- fiddle JavaScript source not shown -->

```html
<div id="greeting">Hello</div>
```

```js hide
cy.get('div#greeting').should('have.text', 'Hello')
```

<!-- fiddle-end -->

## Partial code

This test has several JS code blocks, and some of them are hidden

<!-- fiddle only some JavaScript source is shown -->

```html
<div id="greeting">Hello</div>
```

```js hide
cy.log('this block is hidden')
```

Only this code block should be shown on the page

```js
cy.get('div#greeting').should('have.text', 'Hello')
```

```js hide
cy.log('this block is also hidden')
```

<!-- fiddle-end -->
