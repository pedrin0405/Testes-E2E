// ============================================================
// backend/server.js
// Responsabilidade: criar e configurar o servidor HTTP da
// aplicação usando o framework Express.
//
// Este arquivo define:
//   - os middlewares globais (CORS, JSON, arquivos estáticos)
//   - a rota de autenticação POST /login
//   - as rotas de navegação GET / e GET /home
//   - a inicialização do servidor na porta 3001
// ============================================================

// Express: framework web minimalista para Node.js
const express = require('express');

// bcryptjs: biblioteca para comparar a senha enviada pelo
// usuário com o hash armazenado no banco de dados
const bcrypt = require('bcryptjs');

// cors: middleware que habilita o CORS (Cross-Origin Resource
// Sharing), permitindo que o navegador faça requisições
// ao servidor de origens diferentes (ex: porta 5500 → 3001)
const cors = require('cors');

// path: módulo nativo do Node.js para montar caminhos de arquivos
const path = require('path');

// Importa a função de acesso ao banco de dados SQLite
const { getDb } = require('./database');

// Cria a instância da aplicação Express
const app = express();

// Define a porta do servidor. Usa a variável de ambiente PORT
// se existir (ex: em produção/Heroku), senão usa 3001 localmente.
const PORT = process.env.PORT || 3001;

// ── Middlewares globais ───────────────────────────────────────

// Habilita CORS para qualquer origem ('*').
// Em produção, substituiria '*' pelo domínio real do frontend.
app.use(cors({ origin: '*' }));

// Permite que o Express faça o parse automático de requisições
// com corpo em JSON (ex: { "email": "...", "password": "..." })
app.use(express.json());

// Serve os arquivos estáticos da pasta /frontend (HTML, CSS, JS)
// como se fosse um servidor de arquivos simples.
// Quando o usuário acessa "/styles.css", o Express devolve o arquivo
// correspondente em /frontend/styles.css automaticamente.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── Rotas ─────────────────────────────────────────────────────

/**
 * POST /login
 *
 * Endpoint de autenticação. Recebe e-mail e senha no corpo
 * da requisição, consulta o banco de dados e responde com:
 *   - 200 + dados do usuário  → credenciais válidas
 *   - 400                     → campos ausentes no corpo
 *   - 401                     → usuário não encontrado ou senha incorreta
 */
app.post('/login', (req, res) => {
  // Desestrutura os campos do corpo da requisição JSON
  const { email, password } = req.body;

  // ── Validação de entrada ──────────────────────────────────
  // Se qualquer campo estiver vazio/ausente, retorna 400 (Bad Request)
  // antes mesmo de consultar o banco de dados.
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'E-mail e senha são obrigatórios.',
    });
  }

  // Obtém a conexão com o banco de dados SQLite
  const db = getDb();

  // Busca o usuário pelo e-mail informado.
  // O método .get() retorna um objeto ou undefined (se não encontrar).
  // O "?" é um placeholder preparado (evita SQL Injection).
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  // ── Verificação de existência ─────────────────────────────
  // Se nenhum usuário foi encontrado com esse e-mail, retorna 401.
  // Retornamos "Credenciais inválidas" (mensagem genérica) para não
  // revelar ao atacante se o e-mail existe ou não no sistema.
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas',
    });
  }

  // ── Verificação de senha ──────────────────────────────────
  // bcrypt.compareSync compara a senha em texto puro enviada pelo
  // usuário com o hash armazenado no banco.
  // Retorna true se forem equivalentes, false caso contrário.
  const passwordMatch = bcrypt.compareSync(password, user.password_hash);

  // Se a senha não corresponder ao hash, retorna 401
  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas',
    });
  }

  // ── Sucesso ───────────────────────────────────────────────
  // Retorna status 200 com os dados públicos do usuário.
  // IMPORTANTE: nunca enviamos o password_hash na resposta!
  return res.status(200).json({
    success: true,
    message: 'Login efetuado com sucesso!',
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
    },
  });
});

/**
 * GET /home
 *
 * Rota que serve a página HTML da área logada.
 * O Express procura o arquivo home.html dentro de /frontend.
 */
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'home.html'));
});

/**
 * GET /
 *
 * Rota raiz: serve a página de login (index.html).
 * Esta rota funciona como fallback — qualquer acesso à raiz
 * do servidor devolve a tela de login.
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Inicialização do servidor ─────────────────────────────────

// app.listen() inicia o servidor HTTP na porta especificada.
// O callback é executado assim que o servidor estiver pronto
// para receber requisições.
app.listen(PORT, () => {
  console.log(`[Server] Rodando em http://localhost:${PORT}`);

  // Inicializa o banco de dados na startup do servidor
  // para garantir que o seed rode antes da primeira requisição
  getDb();
});

// Exporta o app para possibilitar testes unitários futuros
// (ex: com supertest) sem precisar de um servidor real em pé.
module.exports = app;
