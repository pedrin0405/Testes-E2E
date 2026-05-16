describe('Autenticação — Fluxo de Login', () => {
  const selectors = {
    email:         '#email',
    password:      '#password',
    loginBtn:      '#login-btn',
    alertSuccess:  '#alert-success',
    alertError:    '#alert-error',
    emailError:    '#email-error',
    passwordError: '#password-error',
    successBanner: '#success-banner',
  };

  beforeEach(() => {
    cy.visit('/');
  });

  describe('1. Login com sucesso', () => {
    it('deve redirecionar para /home após login com credenciais válidas', () => {
      cy.get(selectors.email)
        .should('be.visible')
        .type('usuario@teste.com');

      cy.get(selectors.password)
        .should('be.visible')
        .type('senha123');

      cy.get(selectors.loginBtn).should('not.be.disabled');
      cy.get(selectors.loginBtn).click();

      cy.url().should('include', '/home', { timeout: 10000 });

      cy.get(selectors.successBanner, { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', 'Login efetuado com sucesso!');
    });

    it('deve exibir mensagem de sucesso no formulário antes do redirecionamento', () => {
      cy.intercept('POST', '/login').as('loginCall');

      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).click();

      cy.wait('@loginCall').then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        expect(response.body.message).to.eq('Login efetuado com sucesso!');
      });

      cy.url().should('include', '/home', { timeout: 10000 });
    });

    it('deve aceitar credenciais do segundo usuário seed', () => {
      cy.get(selectors.email).type('admin@teste.com');
      cy.get(selectors.password).type('admin@456');
      cy.get(selectors.loginBtn).click();

      cy.url().should('include', '/home', { timeout: 10000 });
      cy.get(selectors.successBanner).should('contain.text', 'Login efetuado com sucesso!');
    });
  });

  describe('2. Login com erro — credenciais inválidas', () => {
    it('deve exibir "Credenciais inválidas" com e-mail inexistente', () => {
      cy.get(selectors.email).type('naoexiste@email.com');
      cy.get(selectors.password).type('qualquersenha');
      cy.get(selectors.loginBtn).click();

      cy.url().should('not.include', '/home');

      cy.get(selectors.alertError)
        .should('be.visible')
        .and('contain.text', 'Credenciais inválidas');
    });

    it('deve exibir "Credenciais inválidas" com senha incorreta', () => {
      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.password).type('senhaerrada999');
      cy.get(selectors.loginBtn).click();

      cy.url().should('not.include', '/home');
      cy.get(selectors.alertError)
        .should('be.visible')
        .and('contain.text', 'Credenciais inválidas');
    });

    it('deve manter o usuário na tela de login após falha', () => {
      cy.get(selectors.email).type('invalido@teste.com');
      cy.get(selectors.password).type('errado');
      cy.get(selectors.loginBtn).click();

      cy.location('pathname').should('eq', '/');
      cy.get('#login-form').should('be.visible');
    });

    it('deve limpar o alerta de erro ao digitar novamente', () => {
      cy.get(selectors.email).type('invalido@teste.com');
      cy.get(selectors.password).type('errado');
      cy.get(selectors.loginBtn).click();

      cy.get(selectors.alertError).should('be.visible');

      cy.get(selectors.email).clear().type('novo@email.com');
      cy.get(selectors.alertError).should('have.attr', 'hidden');
    });
  });

  describe('3. Estado do botão "Entrar"', () => {
    it('deve estar desabilitado quando a página carrega (ambos campos vazios)', () => {
      cy.get(selectors.loginBtn).should('be.disabled');
    });

    it('deve estar desabilitado quando apenas o e-mail está preenchido', () => {
      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.loginBtn).should('be.disabled');
    });

    it('deve estar desabilitado quando apenas a senha está preenchida', () => {
      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).should('be.disabled');
    });

    it('deve ser habilitado somente quando ambos os campos estão preenchidos', () => {
      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.loginBtn).should('be.disabled');

      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).should('not.be.disabled');
    });

    it('deve voltar a ser desabilitado ao limpar um dos campos', () => {
      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.password).type('senha123');

      cy.get(selectors.loginBtn).should('not.be.disabled');

      cy.get(selectors.password).clear();
      cy.get(selectors.loginBtn).should('be.disabled');
    });

    it('deve ser desabilitado com apenas espaços em branco no e-mail', () => {
      cy.get(selectors.email).type('   ');
      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).should('be.disabled');
    });
  });

  describe('4. Validação de campos obrigatórios', () => {
    it('deve exibir mensagem de obrigatoriedade do e-mail ao submeter sem preencher', () => {
      cy.get(selectors.loginBtn).invoke('removeAttr', 'disabled');
      cy.get(selectors.loginBtn).click();

      cy.get(selectors.emailError)
        .should('be.visible')
        .and('contain.text', 'O e-mail é obrigatório');
    });

    it('deve exibir mensagem de obrigatoriedade da senha ao submeter sem preencher', () => {
      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.loginBtn).invoke('removeAttr', 'disabled');
      cy.get(selectors.loginBtn).click();

      cy.get(selectors.passwordError)
        .should('be.visible')
        .and('contain.text', 'A senha é obrigatória');
    });

    it('deve exibir ambas as mensagens de obrigatoriedade quando tudo está vazio', () => {
      cy.get(selectors.loginBtn).invoke('removeAttr', 'disabled');
      cy.get(selectors.loginBtn).click();

      cy.get(selectors.emailError)
        .should('be.visible')
        .and('contain.text', 'O e-mail é obrigatório');

      cy.get(selectors.passwordError)
        .should('be.visible')
        .and('contain.text', 'A senha é obrigatória');
    });

    it('deve remover a mensagem de erro ao preencher o campo', () => {
      cy.get(selectors.loginBtn).invoke('removeAttr', 'disabled');
      cy.get(selectors.loginBtn).click();

      cy.get(selectors.emailError).should('be.visible');

      cy.get(selectors.email).type('qualquer@email.com');
      cy.get(selectors.emailError).should('have.attr', 'hidden');
    });

    it('os inputs devem ter atributos aria-required para acessibilidade', () => {
      cy.get(selectors.email).should('have.attr', 'aria-required', 'true');
      cy.get(selectors.password).should('have.attr', 'aria-required', 'true');
    });
  });

  describe('5. Integração com a API REST', () => {
    it('deve chamar POST /login com o corpo correto', () => {
      cy.intercept('POST', '/login').as('loginRequest');

      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).click();

      cy.wait('@loginRequest').then(({ request, response }) => {
        expect(request.body).to.deep.include({
          email:    'usuario@teste.com',
          password: 'senha123',
        });

        expect(response.statusCode).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.message).to.eq('Login efetuado com sucesso!');
      });
    });

    it('deve retornar status 401 para credenciais inválidas', () => {
      cy.intercept('POST', '/login').as('loginRequest');

      cy.get(selectors.email).type('errado@email.com');
      cy.get(selectors.password).type('senhaerrada');
      cy.get(selectors.loginBtn).click();

      cy.wait('@loginRequest').then(({ response }) => {
        expect(response.statusCode).to.eq(401);
        expect(response.body.success).to.be.false;
      });
    });

    it('deve lidar com erro de servidor graciosamente (mock 500)', () => {
      cy.intercept('POST', '/login', {
        statusCode: 500,
        body: { success: false, message: 'Erro interno do servidor' },
      }).as('serverError');

      cy.get(selectors.email).type('usuario@teste.com');
      cy.get(selectors.password).type('senha123');
      cy.get(selectors.loginBtn).click();

      cy.wait('@serverError');

      cy.url().should('not.include', '/home');
      cy.get(selectors.alertError).should('be.visible');
    });
  });
});
