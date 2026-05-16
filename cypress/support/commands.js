Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  if (email)    cy.get('#email').type(email);
  if (password) cy.get('#password').type(password);
  cy.get('#login-btn').click();
});

Cypress.Commands.add('clearLoginForm', () => {
  cy.get('#email').clear();
  cy.get('#password').clear();
});
