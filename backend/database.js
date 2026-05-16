// ============================================================
// backend/database.js
// Responsabilidade: configurar e inicializar o banco de dados
// SQLite que armazena os usuários da aplicação.
//
// O SQLite é um banco de dados embutido (não precisa de servidor
// separado). O arquivo "auth.db" é criado automaticamente na
// primeira execução dentro da pasta /backend.
// ============================================================

// Importa o driver SQLite síncrono (better-sqlite3)
const Database = require('better-sqlite3');

// Importa bcryptjs para gerar e comparar hashes de senha
// (nunca armazenamos a senha em texto puro no banco)
const bcrypt = require('bcryptjs');

// Importa o módulo nativo 'path' para montar caminhos de arquivo
// de forma segura em qualquer sistema operacional
const path = require('path');

// Define o caminho absoluto onde o arquivo do banco será criado.
// __dirname aponta para a pasta onde este arquivo está (/backend).
const DB_PATH = path.join(__dirname, 'auth.db');

// Variável que guarda a instância única do banco (padrão Singleton).
// Assim evitamos abrir múltiplas conexões desnecessárias.
let db;

// ── Função principal exportada ────────────────────────────────
/**
 * getDb()
 * Retorna a instância do banco de dados. Se ainda não existir,
 * cria a conexão, ativa o modo WAL (Write-Ahead Logging) para
 * melhor performance de escrita, e inicializa o schema + seed.
 */
function getDb() {
  if (!db) {
    // Abre (ou cria) o arquivo do banco de dados SQLite
    db = new Database(DB_PATH);

    // WAL (Write-Ahead Logging): modo de journaling que permite
    // leituras concorrentes enquanto uma escrita ocorre —
    // melhora bastante a performance em aplicações web.
    db.pragma('journal_mode = WAL');

    // Cria as tabelas e insere dados iniciais
    initSchema();
  }
  return db;
}

// ── Criação do schema ─────────────────────────────────────────
/**
 * initSchema()
 * Executa o SQL que cria a tabela de usuários caso ela não
 * exista ainda. O "IF NOT EXISTS" garante que não haverá erro
 * ao rodar o servidor mais de uma vez.
 */
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT, -- identificador único gerado automaticamente
      email         TEXT UNIQUE NOT NULL,              -- e-mail único (não pode repetir)
      password_hash TEXT NOT NULL,                     -- hash bcrypt da senha (nunca texto puro)
      name          TEXT NOT NULL,                     -- nome de exibição do usuário
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP -- data/hora de criação do registro
    )
  `);

  // Após garantir que a tabela existe, popula com usuários de teste
  seedUsers();
}

// ── Dados iniciais (seed) ─────────────────────────────────────
/**
 * seedUsers()
 * Verifica se já existem usuários no banco. Caso não haja,
 * insere dois usuários de teste com senhas já hasheadas.
 *
 * O bcrypt.hashSync(senha, saltRounds) gera um hash seguro
 * — o "10" indica o custo de processamento (fator de trabalho).
 * Quanto maior, mais seguro e mais lento.
 */
function seedUsers() {
  // Conta quantos registros existem na tabela users
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get();

  // Só insere se o banco estiver vazio (evita duplicatas)
  if (count.c === 0) {
    // ── Usuário 1 ──────────────────────────────────────────────
    // Gera o hash da senha "senha123" com bcrypt (saltRounds = 10)
    const hash = bcrypt.hashSync('senha123', 10);

    // Insere o primeiro usuário de teste
    db.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).run('usuario@teste.com', hash, 'Usuário Teste');

    // ── Usuário 2 ──────────────────────────────────────────────
    // Gera o hash da senha "admin@456"
    const hash2 = bcrypt.hashSync('admin@456', 10);

    // Insere o segundo usuário (perfil de administrador)
    db.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).run('admin@teste.com', hash2, 'Administrador');

    // Confirma no terminal que os dados foram inseridos
    console.log('[DB] Usuários seed inseridos com sucesso.');
  }
}

// Exporta apenas a função getDb, que é o ponto de acesso
// centralizado ao banco em todo o projeto.
module.exports = { getDb };
