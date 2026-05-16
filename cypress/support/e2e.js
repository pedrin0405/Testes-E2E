import './commands';

Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('fetch') ||
    err.message.includes('sessionStorage') ||
    err.message.includes('NetworkError')
  ) {
    return false;
  }
  return true;
});
