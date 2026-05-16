// ============================================================
// cypress/support/commands.js
// Responsabilidade: definir comandos customizados do Cypress
// que podem ser reutilizados em qualquer arquivo de spec.
//
// Comandos customizados evitam repetição de código nos testes:
// em vez de digitar as mesmas 4 linhas toda hora, chamamos
// apenas cy.login('email', 'senha').
// ============================================================

/**
 * cy.login(email, password)
 *
 * Comando de atalho que simula o fluxo completo de login:
 *   1. Navega para a página de login (/)
 *   2. Preenche o campo e-mail (se fornecido)
 *   3. Preenche o campo senha (se fornecido)
 *   4. Clica no botão "Entrar"
 *
 * O uso de condicionais (if email / if password) permite
 * chamar cy.login() com apenas um campo preenchido para
 * testar cenários parciais (ex: só e-mail, sem senha).
 *
 * @example
 *   cy.login('usuario@teste.com', 'senha123') // login completo
 *   cy.login('usuario@teste.com', '')          // só e-mail
 */
Cypress.Commands.add('login', (email, password) => {
  // Navega para a URL base + "/" (página de login)
  cy.visit('/');

  // Preenche o campo de e-mail somente se o valor for fornecido
  if (email)    cy.get('#email').type(email);

  // Preenche o campo de senha somente se o valor for fornecido
  if (password) cy.get('#password').type(password);

  // Clica no botão de submit
  cy.get('#login-btn').click();
});

/**
 * cy.clearLoginForm()
 *
 * Limpa os dois campos do formulário de login.
 * Útil para resetar o estado do formulário entre asserções
 * dentro do mesmo teste.
 *
 * @example
 *   cy.clearLoginForm()
 *   // Agora o botão deve estar desabilitado novamente
 */
Cypress.Commands.add('clearLoginForm', () => {
  cy.get('#email').clear();    // apaga o conteúdo do campo e-mail
  cy.get('#password').clear(); // apaga o conteúdo do campo senha
});
