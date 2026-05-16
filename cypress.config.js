// ============================================================
// cypress.config.js
// Responsabilidade: arquivo de configuração central do Cypress.
//
// O Cypress usa este arquivo para saber:
//   - onde estão os arquivos de teste (specs)
//   - qual é a URL base da aplicação
//   - timeouts e opções de execução
//   - se deve gravar vídeo ou tirar screenshots
// ============================================================

// defineConfig: função auxiliar do Cypress que habilita
// o autocomplete e a validação de tipos no editor de código.
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // Configurações específicas para testes End-to-End (E2E)
  e2e: {

    // ── URL base da aplicação ─────────────────────────────────
    // Quando usamos cy.visit('/'), o Cypress abre esta URL.
    // Evita repetir "http://localhost:3001" em cada teste.
    baseUrl: 'http://localhost:3001',

    // ── Localização dos specs ─────────────────────────────────
    // Padrão glob que indica onde estão os arquivos de teste.
    // O Cypress procurará qualquer arquivo .cy.js ou .cy.ts
    // dentro de cypress/e2e/ e suas subpastas.
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',

    // ── Arquivo de suporte ────────────────────────────────────
    // Este arquivo é carregado ANTES de cada spec.
    // Usado para configurações globais e importar comandos customizados.
    supportFile: 'cypress/support/e2e.js',

    // ── Dimensões da janela do navegador nos testes ───────────
    viewportWidth: 1280,  // largura em pixels
    viewportHeight: 800,  // altura em pixels

    // ── Timeouts ──────────────────────────────────────────────
    // defaultCommandTimeout: tempo máximo (ms) que o Cypress espera
    // por um comando antes de falhar (ex: cy.get(), cy.should())
    defaultCommandTimeout: 8000,

    // pageLoadTimeout: tempo máximo para uma página carregar completamente
    pageLoadTimeout: 30000,

    // requestTimeout: tempo máximo para uma requisição HTTP responder
    // (usado em cy.intercept e cy.request)
    requestTimeout: 10000,

    // ── Gravação de vídeo ─────────────────────────────────────
    // Quando true, o Cypress grava um vídeo de cada execução.
    // O arquivo .mp4 é salvo em cypress/videos/
    video: true,

    // Tira um screenshot automático quando um teste falha.
    // Salvo em cypress/screenshots/ com o nome do teste.
    screenshotOnRunFailure: true,

    // Permite executar todos os specs de uma vez no modo interativo
    experimentalRunAllSpecs: true,

    /**
     * setupNodeEvents(on, config)
     * Função chamada durante a inicialização do Cypress no Node.js.
     * Aqui podemos registrar event listeners para tarefas como:
     *   - limpar o banco de dados antes de cada spec
     *   - ler variáveis de ambiente
     *   - configurar plugins de relatório
     * Por ora, apenas retorna o config sem modificações.
     */
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
