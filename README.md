# AuthFlow — Testes E2E com Cypress

Aplicação fullstack completa de autenticação com testes E2E cobrindo o fluxo login → home.

## Estrutura do Projeto

```
Testes E2E/
├── backend/
│   ├── server.js          # API REST (Express)
│   └── database.js        # SQLite + seed de usuários (bcrypt)
├── frontend/
│   ├── index.html         # Página de Login
│   ├── home.html          # Página Home
│   ├── styles.css         # Design System (dark mode, glassmorphism)
│   ├── login.js           # Lógica da página de login
│   └── home.js            # Lógica da página home
├── cypress/
│   ├── e2e/auth/
│   │   └── login.cy.js    # Suíte E2E (21 testes)
│   └── support/
│       ├── e2e.js         # Config global do Cypress
│       └── commands.js    # Comandos customizados
├── cypress.config.js      # Configuração do Cypress
└── package.json
```

## Tecnologias

| Camada    | Tecnologia                            |
|-----------|---------------------------------------|
| Frontend  | HTML5 · CSS3 · JavaScript Vanilla     |
| Backend   | Node.js · Express                     |
| Banco     | SQLite (better-sqlite3) · bcryptjs    |
| Testes    | Cypress 15                            |

## Credenciais de Teste

| E-mail               | Senha       |
|----------------------|-------------|
| usuario@teste.com    | senha123    |
| admin@teste.com      | admin@456   |

## API

### `POST /login`

**Corpo:**
```json
{ "email": "usuario@teste.com", "password": "senha123" }
```

**Sucesso (200):**
```json
{ "success": true, "message": "Login efetuado com sucesso!", "user": { ... } }
```

**Falha (401):**
```json
{ "success": false, "message": "Credenciais inválidas" }
```

**Falha (400):**
```json
{ "success": false, "message": "E-mail e senha são obrigatórios." }
```

## Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o servidor
```bash
npm start
# ou
npm run dev
```
> Acesse: http://localhost:3001

### 3. Rodar testes (modo headless — CI)
```bash
npm test
# ou
npm run cypress:run
```

### 4. Abrir interface visual do Cypress
```bash
npm run cypress:open
```

## Resultados dos Testes (21 testes · 0 falhas)

```
Autenticação — Fluxo de Login
  1. Login com sucesso
    ✓ deve redirecionar para /home após login com credenciais válidas
    ✓ deve exibir mensagem de sucesso no formulário antes do redirecionamento
    ✓ deve aceitar credenciais do segundo usuário seed

  2. Login com erro — credenciais inválidas
    ✓ deve exibir "Credenciais inválidas" com e-mail inexistente
    ✓ deve exibir "Credenciais inválidas" com senha incorreta
    ✓ deve manter o usuário na tela de login após falha
    ✓ deve limpar o alerta de erro ao digitar novamente

  3. Estado do botão "Entrar"
    ✓ deve estar desabilitado quando a página carrega (ambos campos vazios)
    ✓ deve estar desabilitado quando apenas o e-mail está preenchido
    ✓ deve estar desabilitado quando apenas a senha está preenchida
    ✓ deve ser habilitado somente quando ambos os campos estão preenchidos
    ✓ deve voltar a ser desabilitado ao limpar um dos campos
    ✓ deve ser desabilitado com apenas espaços em branco no e-mail

  4. Validação de campos obrigatórios
    ✓ deve exibir mensagem de obrigatoriedade do e-mail ao submeter sem preencher
    ✓ deve exibir mensagem de obrigatoriedade da senha ao submeter sem preencher
    ✓ deve exibir ambas as mensagens de obrigatoriedade quando tudo está vazio
    ✓ deve remover a mensagem de erro ao preencher o campo
    ✓ os inputs devem ter atributos aria-required para acessibilidade

  5. Integração com a API REST
    ✓ deve chamar POST /login com o corpo correto
    ✓ deve retornar status 401 para credenciais inválidas
    ✓ deve lidar com erro de servidor graciosamente (mock 500)

21 passing (15s)
```
