// ============================================================
// cypress/e2e/auth/login.cy.js
// Responsabilidade: suíte de testes E2E (End-to-End) para o
// fluxo completo de autenticação da aplicação AuthFlow.
//
// "E2E" significa que os testes simulam um usuário real
// interagindo com o navegador — preenchendo campos, clicando
// em botões e verificando o resultado na tela — testando
// TODA a pilha: frontend → backend → banco de dados.
//
// Credenciais válidas configuradas no seed do banco:
//   email:  usuario@teste.com   senha: senha123
//   email:  admin@teste.com     senha: admin@456
// ============================================================

// describe() agrupa testes relacionados sob um mesmo título.
// É o equivalente de uma "pasta" de testes.
// O primeiro argumento é o nome da suíte (exibido no relatório).
describe('Autenticação — Fluxo de Login', () => {

  // ── Seletores CSS centralizados ───────────────────────────
  // Ao centralizar os seletores em um objeto, se o "id" de um
  // elemento HTML mudar, basta atualizar aqui — todos os testes
  // se adaptam automaticamente.
  const selectors = {
    email:         '#email',          // campo de e-mail
    password:      '#password',       // campo de senha
    loginBtn:      '#login-btn',      // botão "Entrar"
    alertSuccess:  '#alert-success',  // alerta verde de sucesso (na tela de login)
    alertError:    '#alert-error',    // alerta vermelho de erro
    emailError:    '#email-error',    // mensagem de erro do campo e-mail
    passwordError: '#password-error', // mensagem de erro do campo senha
    successBanner: '#success-banner', // banner de boas-vindas (na página Home)
  };

  // ── beforeEach ────────────────────────────────────────────
  // beforeEach() é executado ANTES DE CADA teste (it/specify).
  // Garante que cada teste comece com um estado limpo (fresh state),
  // sem interferência de testes anteriores.
  beforeEach(() => {
    // Navega para a página inicial (login) antes de cada teste
    cy.visit('/');
  });

  // ══════════════════════════════════════════════════════════
  // GRUPO 1: LOGIN COM SUCESSO
  // Valida o fluxo feliz: credenciais corretas → redirecionamento
  // ══════════════════════════════════════════════════════════
  describe('1. Login com sucesso', () => {

    /**
     * Teste 1.1: Fluxo principal de login bem-sucedido.
     * Verifica o redirecionamento e a mensagem na Home.
     */
    it('deve redirecionar para /home após login com credenciais válidas', () => {
      // ── Arrange (preparação) ──────────────────────────────
      // cy.get() localiza o elemento pelo seletor CSS e retorna
      // um "subject" (objeto Cypress encadeável).
      // .should() faz uma asserção (verificação) sobre o elemento.
      cy.get(selectors.email)
        .should('be.visible')     // verifica se o campo está visível
        .type('usuario@teste.com'); // digita o texto no campo

      cy.get(selectors.password)
        .should('be.visible')
        .type('senha123');

      // ── Assert intermediário ──────────────────────────────
      // Antes de clicar, confirma que o botão está habilitado.
      // 'not.be.disabled' = atributo disabled está ausente.
      cy.get(selectors.loginBtn).should('not.be.disabled');

      // ── Act (ação) ────────────────────────────────────────
      // Clica no botão "Entrar" para submeter o formulário
      cy.get(selectors.loginBtn).click();

      // ── Assert (verificações pós-ação) ────────────────────
      // 1) Verifica que a URL mudou para /home.
      //    timeout: 10000 dá até 10s para o redirecionamento acontecer.
      cy.url().should('include', '/home', { timeout: 10000 });

      // 2) Verifica que o banner de sucesso está visível na Home
      //    e contém o texto esperado.
      cy.get(selectors.successBanner, { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', 'Login efetuado com sucesso!');
    });

    /**
     * Teste 1.2: Verifica a resposta da API antes do redirect.
     * Usa cy.intercept() para "espionar" a chamada de rede.
     */
    it('deve exibir mensagem de sucesso no formulário antes do redirecionamento', () => {
      // cy.intercept() intercepta requisições de rede.
      // Aqui configuramos um "alias" chamado 'loginCall'
      // para podermos esperar por ela mais tarde com cy.wait().
      cy.intercept('POST', '/login').as('loginCall');

      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).click();

      // cy.wait('@loginCall') pausa o teste até que a requisição
      // interceptada seja concluída, então executa o callback
      // com os detalhes da requisição e da resposta.
      cy.wait('@loginCall').then(({ response }) => {
        // Verifica o status HTTP da resposta da API
        expect(response.statusCode).to.eq(200);
        // Verifica a mensagem no corpo da resposta JSON
        expect(response.body.message).to.eq('Login efetuado com sucesso!');
      });

      // Confirma o redirecionamento como validação extra
      cy.url().should('include', '/home', { timeout: 10000 });
    });

    /**
     * Teste 1.3: Garante que o segundo usuário seed também funciona.
     * Valida que o banco tem os dois usuários cadastrados.
     */
    it('deve aceitar credenciais do segundo usuário seed', () => {
      cy.get(selectors.email).type('admin@teste.com');
      cy.get(selectors.password).type('admin@456');
      cy.get(selectors.loginBtn).click();

      cy.url().should('include', '/home', { timeout: 10000 });
      cy.get(selectors.successBanner).should('contain.text', 'Login efetuado com sucesso!');
    });
  });

  // ══════════════════════════════════════════════════════════
  // GRUPO 2: LOGIN COM ERRO
  // Valida o fluxo de falha: credenciais inválidas → erro
  // ══════════════════════════════════════════════════════════
  describe('2. Login com erro — credenciais inválidas', () => {

    /**
     * Teste 2.1: E-mail que não existe no banco de dados.
     * O servidor deve retornar 401 e o frontend exibe o erro.
     */
    it('deve exibir "Credenciais inválidas" com e-mail inexistente', () => {
      cy.get(selectors.email).type('naoexiste@email.com');
      cy.get(selectors.password).type('qualquersenha');
      cy.get(selectors.loginBtn).click();

      // 1) URL não deve mudar para /home (usuário permanece no login)
      cy.url().should('not.include', '/home');

      // 2) Alerta de erro deve aparecer com a mensagem correta
      cy.get(selectors.alertError)
        .should('be.visible')
        .and('contain.text', 'Credenciais inválidas');
    });

    /**
     * Teste 2.2: E-mail existe mas a senha está errada.
     * Valida que o bcrypt.compareSync retorna false e o
     * servidor responde com 401.
     */
    it('deve exibir "Credenciais inválidas" com senha incorreta', () => {
      cy.get(selectors.email).type('usuario@teste.com'); // e-mail válido
      cy.get(selectors.password).type('senhaerrada999'); // senha inválida
      cy.get(selectors.loginBtn).click();

      cy.url().should('not.include', '/home');
      cy.get(selectors.alertError)
        .should('be.visible')
        .and('contain.text', 'Credenciais inválidas');
    });

    /**
     * Teste 2.3: Verifica que o formulário ainda está na tela.
     * cy.location() retorna informações sobre a URL atual.
     * pathname: apenas o caminho, sem domínio (ex: "/" ou "/home")
     */
    it('deve manter o usuário na tela de login após falha', () => {
      cy.get(selectors.email).type('invalido@teste.com');
      cy.get(selectors.password).type('errado');
      cy.get(selectors.loginBtn).click();

      // Confirma que o pathname é exatamente "/" (raiz = login)
      cy.location('pathname').should('eq', '/');

      // O formulário ainda deve estar visível na página
      cy.get('#login-form').should('be.visible');
    });

    /**
     * Teste 2.4: Valida que o alerta de erro some ao redigitar.
     * O login.js chama hideAlerts() no evento "input" dos campos.
     */
    it('deve limpar o alerta de erro ao digitar novamente', () => {
      // Provoca o erro primeiro
      cy.get(selectors.email).type('invalido@teste.com');
      cy.get(selectors.password).type('errado');
      cy.get(selectors.loginBtn).click();

      // Confirma que o alerta de erro apareceu
      cy.get(selectors.alertError).should('be.visible');

      // Digita novamente no campo de e-mail
      cy.get(selectors.email).clear().type('novo@email.com');

      // Verifica que o alerta sumiu.
      // O login.js usa element.hidden = true → o atributo DOM "hidden" é adicionado.
      // .should('have.attr', 'hidden') verifica a presença desse atributo.
      cy.get(selectors.alertError).should('have.attr', 'hidden');
    });
  });

  // ══════════════════════════════════════════════════════════
  // GRUPO 3: ESTADO DO BOTÃO "ENTRAR"
  // Valida a lógica de habilitar/desabilitar o botão conforme
  // o preenchimento dos campos
  // ══════════════════════════════════════════════════════════
  describe('3. Estado do botão "Entrar"', () => {

    /**
     * Teste 3.1: Estado inicial da página.
     * Quando nenhum campo foi preenchido, o botão deve estar
     * desabilitado desde o primeiro carregamento.
     */
    it('deve estar desabilitado quando a página carrega (ambos campos vazios)', () => {
      // 'be.disabled' verifica se o atributo "disabled" está presente
      cy.get(selectors.loginBtn).should('be.disabled');
    });

    /**
     * Teste 3.2: Apenas e-mail preenchido.
     * O botão NÃO deve ser habilitado com apenas um campo.
     */
    it('deve estar desabilitado quando apenas o e-mail está preenchido', () => {
      cy.get(selectors.email).type('usuario@teste.com');
      // A senha ainda está vazia → botão deve permanecer desabilitado
      cy.get(selectors.loginBtn).should('be.disabled');
    });

    /**
     * Teste 3.3: Apenas senha preenchida.
     * Análogo ao 3.2, mas com a situação inversa.
     */
    it('deve estar desabilitado quando apenas a senha está preenchida', () => {
      cy.get(selectors.password).type('senha123');
      // O e-mail ainda está vazio → botão deve permanecer desabilitado
      cy.get(selectors.loginBtn).should('be.disabled');
    });

    /**
     * Teste 3.4: Ambos os campos preenchidos.
     * Verifica a transição de desabilitado → habilitado.
     */
    it('deve ser habilitado somente quando ambos os campos estão preenchidos', () => {
      // Passo 1: digita o e-mail → botão ainda desabilitado
      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.loginBtn).should('be.disabled');

      // Passo 2: digita a senha → botão deve ser habilitado
      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).should('not.be.disabled');
    });

    /**
     * Teste 3.5: Comportamento ao limpar um campo.
     * Verifica a transição de habilitado → desabilitado.
     */
    it('deve voltar a ser desabilitado ao limpar um dos campos', () => {
      // Preenche ambos os campos
      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.password).type('senha123');

      // Confirma que está habilitado
      cy.get(selectors.loginBtn).should('not.be.disabled');

      // Limpa a senha → botão deve ser desabilitado novamente
      cy.get(selectors.password).clear();
      cy.get(selectors.loginBtn).should('be.disabled');
    });

    /**
     * Teste 3.6: Espaços em branco não contam como preenchimento.
     * O login.js usa .trim() para remover espaços antes de verificar.
     */
    it('deve ser desabilitado com apenas espaços em branco no e-mail', () => {
      cy.get(selectors.email).type('   '); // só espaços → não deve habilitar
      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).should('be.disabled');
    });
  });

  // ══════════════════════════════════════════════════════════
  // GRUPO 4: CAMPOS OBRIGATÓRIOS
  // Valida as mensagens de validação individuais por campo
  // ══════════════════════════════════════════════════════════
  describe('4. Validação de campos obrigatórios', () => {

    /**
     * Teste 4.1: Mensagem de obrigatoriedade do e-mail.
     *
     * O botão está naturalmente desabilitado, então usamos
     * .invoke('removeAttr', 'disabled') para removê-lo via
     * JavaScript e forçar o clique — simulando um usuário
     * que tenta burlar a validação do cliente.
     */
    it('deve exibir mensagem de obrigatoriedade do e-mail ao submeter sem preencher', () => {
      // Remove o atributo "disabled" do botão via JavaScript
      // para conseguir clicar mesmo com os campos vazios
      cy.get(selectors.loginBtn).invoke('removeAttr', 'disabled');
      cy.get(selectors.loginBtn).click();

      // Verifica que a mensagem de erro do campo e-mail apareceu
      cy.get(selectors.emailError)
        .should('be.visible')
        .and('contain.text', 'O e-mail é obrigatório');
    });

    /**
     * Teste 4.2: Mensagem de obrigatoriedade da senha.
     * O e-mail está preenchido, mas a senha não.
     */
    it('deve exibir mensagem de obrigatoriedade da senha ao submeter sem preencher', () => {
      cy.get(selectors.email).type('usuario@teste.com'); // e-mail preenchido
      cy.get(selectors.loginBtn).invoke('removeAttr', 'disabled');
      cy.get(selectors.loginBtn).click();

      // Só a mensagem de senha deve aparecer (e-mail está ok)
      cy.get(selectors.passwordError)
        .should('be.visible')
        .and('contain.text', 'A senha é obrigatória');
    });

    /**
     * Teste 4.3: Ambas as mensagens ao mesmo tempo.
     * Nenhum campo preenchido → dois erros simultâneos.
     */
    it('deve exibir ambas as mensagens de obrigatoriedade quando tudo está vazio', () => {
      cy.get(selectors.loginBtn).invoke('removeAttr', 'disabled');
      cy.get(selectors.loginBtn).click();

      // Verifica o erro do e-mail
      cy.get(selectors.emailError)
        .should('be.visible')
        .and('contain.text', 'O e-mail é obrigatório');

      // Verifica o erro da senha
      cy.get(selectors.passwordError)
        .should('be.visible')
        .and('contain.text', 'A senha é obrigatória');
    });

    /**
     * Teste 4.4: Remoção da mensagem ao corrigir o campo.
     * O login.js chama clearFieldError() no evento "input",
     * removendo a borda vermelha e a mensagem de erro.
     */
    it('deve remover a mensagem de erro ao preencher o campo', () => {
      // Força o clique com campo vazio para gerar o erro
      cy.get(selectors.loginBtn).invoke('removeAttr', 'disabled');
      cy.get(selectors.loginBtn).click();

      // Confirma que o erro de e-mail apareceu
      cy.get(selectors.emailError).should('be.visible');

      // Digita no campo — clearFieldError() é chamado no evento input
      cy.get(selectors.email).type('qualquer@email.com');

      // O span de erro usa o atributo HTML 'hidden' para se ocultar.
      // .should('have.attr', 'hidden') verifica a presença do atributo.
      cy.get(selectors.emailError).should('have.attr', 'hidden');
    });

    /**
     * Teste 4.5: Acessibilidade dos campos.
     * Verifica que os campos têm o atributo "aria-required"
     * definido no HTML, que é obrigatório para leitores de tela
     * (acessibilidade web - WCAG).
     */
    it('os inputs devem ter atributos aria-required para acessibilidade', () => {
      // .should('have.attr', nomeAtributo, valor) verifica o valor do atributo
      cy.get(selectors.email).should('have.attr', 'aria-required', 'true');
      cy.get(selectors.password).should('have.attr', 'aria-required', 'true');
    });
  });

  // ══════════════════════════════════════════════════════════
  // GRUPO 5: INTEGRAÇÃO COM A API REST
  // Testa diretamente a comunicação entre frontend e backend,
  // inspecionando as requisições e respostas HTTP reais.
  // ══════════════════════════════════════════════════════════
  describe('5. Integração com a API REST', () => {

    /**
     * Teste 5.1: Verifica o corpo da requisição e a resposta de sucesso.
     * cy.intercept() + cy.wait() permitem inspecionar os detalhes
     * exatos da chamada de rede — validando o contrato da API.
     */
    it('deve chamar POST /login com o corpo correto', () => {
      // Cria um "espião" para a rota POST /login
      cy.intercept('POST', '/login').as('loginRequest');

      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).click();

      // Aguarda a requisição ser completada e inspeciona seus detalhes
      cy.wait('@loginRequest').then(({ request, response }) => {
        // ── Verifica o corpo enviado pelo frontend ──────────
        // deep.include verifica que o objeto contém pelo menos essas propriedades
        expect(request.body).to.deep.include({
          email:    'usuario@teste.com',
          password: 'senha123',
        });

        // ── Verifica a resposta retornada pelo backend ──────
        expect(response.statusCode).to.eq(200);            // HTTP 200 OK
        expect(response.body.success).to.be.true;           // { success: true }
        expect(response.body.message).to.eq('Login efetuado com sucesso!');
      });
    });

    /**
     * Teste 5.2: Verifica o código de status 401 para credenciais inválidas.
     * Garante que o backend está retornando o status HTTP correto.
     */
    it('deve retornar status 401 para credenciais inválidas', () => {
      cy.intercept('POST', '/login').as('loginRequest');

      cy.get(selectors.email).type('errado@email.com');
      cy.get(selectors.password).type('senhaerrada');
      cy.get(selectors.loginBtn).click();

      cy.wait('@loginRequest').then(({ response }) => {
        expect(response.statusCode).to.eq(401);     // HTTP 401 Unauthorized
        expect(response.body.success).to.be.false;  // { success: false }
      });
    });

    /**
     * Teste 5.3: Simula um erro interno do servidor (HTTP 500).
     *
     * cy.intercept() pode não apenas espionar requisições, mas também
     * SUBSTITUÍ-LAS por respostas simuladas (mock/stub).
     * Isso permite testar cenários de erro sem precisar derrubar
     * o servidor real — ideal para testes isolados e confiáveis.
     */
    it('deve lidar com erro de servidor graciosamente (mock 500)', () => {
      // Intercepta e SUBSTITUI a resposta real por um erro simulado
      cy.intercept('POST', '/login', {
        statusCode: 500,                                          // simula erro interno
        body: { success: false, message: 'Erro interno do servidor' }, // resposta mockada
      }).as('serverError');

      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).click();

      cy.wait('@serverError');

      // Mesmo com erro 500, o frontend deve:
      // 1) Manter o usuário na tela de login (não redirecionar)
      cy.url().should('not.include', '/home');

      // 2) Exibir uma mensagem de erro para o usuário
      cy.get(selectors.alertError).should('be.visible');
    });
  });
});
