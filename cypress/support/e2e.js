// ============================================================
// cypress/support/e2e.js
// Responsabilidade: arquivo de suporte global do Cypress.
//
// Este arquivo é executado AUTOMATICAMENTE antes de cada
// arquivo de spec (teste). É o lugar ideal para:
//   - importar comandos customizados
//   - configurar comportamentos globais
//   - suprimir erros desnecessários do navegador
// ============================================================

// Importa o arquivo de comandos customizados.
// Tudo que for definido em commands.js ficará disponível
// como cy.nomeDoComando() em qualquer spec.
import './commands';

// ── Tratamento global de exceções não capturadas ──────────────
/**
 * Cypress.on('uncaught:exception', callback)
 *
 * Por padrão, se qualquer erro não tratado ocorrer no código
 * da aplicação (frontend), o Cypress FALHA o teste automaticamente.
 *
 * Às vezes erros são esperados ou irrelevantes (ex: falhas de
 * requisição de terceiros, erros de rede transitórios).
 * Retornar "false" no callback instrui o Cypress a IGNORAR
 * aquela exceção específica e continuar o teste.
 *
 * @param {Error} err - o objeto de erro capturado
 * @returns {boolean|undefined} false para ignorar, true/undefined para falhar
 */
Cypress.on('uncaught:exception', (err) => {
  // Ignora erros relacionados a chamadas fetch (rede),
  // sessionStorage ou problemas de conexão — todos esperados
  // em cenários de teste onde simulamos falhas de servidor.
  if (
    err.message.includes('fetch') ||
    err.message.includes('sessionStorage') ||
    err.message.includes('NetworkError')
  ) {
    // Retornar false impede que o Cypress falhe o teste
    return false;
  }

  // Para qualquer outro erro inesperado, deixa o Cypress
  // falhar o teste normalmente (comportamento padrão)
  return true;
});
