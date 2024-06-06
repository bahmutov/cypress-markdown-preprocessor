# Comments

<!-- fiddle The selector should be escaped -->

<!-- prettier-ignore-start -->

```html hide
<div data-cy="info" style="display:none;">
  <span data-user-id="user:1"></span>
</div>
<div id="users">
  <div id="user-1">John Doe</div>
</div>
  <div id="students">
    <div id="user-2">Mary Sue</div>
  </div>
```

<!-- prettier-ignore-end -->

```js
cy.wrap(42).should('equal', 42)
```

Check the HTML elements

```js
cy.get('[data-user-id="user:1"]').should('have.text', '')
cy.get('#user-2').should('have.text', 'Mary Sue')
```

<!--
  multi-line comment
  goes here
-->

<!-- fiddle-end -->
