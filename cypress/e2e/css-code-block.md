<!-- fiddle CSS Code block -->

```html
<div id="greeting">Hello</div>
```

```css
#greeting {
  color: #f0f;
  padding: 1rem;
  font-weight: bold;
}
```

```js
cy.get('div#greeting')
  .should('have.text', 'Hello')
  .and('have.css', 'color', 'rgb(255, 0, 255)')
```

<!-- fiddle-end -->
