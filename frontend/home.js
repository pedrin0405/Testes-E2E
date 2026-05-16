// ============================================================
// frontend/home.js
// Responsabilidade: controlar o comportamento da página Home
// (home.html), que é exibida após o login bem-sucedido.
//
// Funcionalidades:
//   1. Recuperar os dados da sessão e personalizar a página
//   2. Fechar o banner de boas-vindas
//   3. Fazer logout e redirecionar para a tela de login
// ============================================================

// ── 1. Recuperação dos dados da sessão ───────────────────────
// Após o login bem-sucedido, o login.js armazenou os dados do
// usuário e a hora do login na sessionStorage.
// Aqui recuperamos esses dados para personalizar a página.

// Tenta obter o JSON com os dados do usuário logado.
// Retorna null se a chave não existir (ex: acesso direto à /home).
const rawUser   = sessionStorage.getItem('authUser');

// Tenta obter a hora registrada no momento do login
const loginTime = sessionStorage.getItem('loginTime');

// ── Seleção dos elementos do DOM que serão personalizados ─────
const userNameDisplay = document.getElementById('user-name-display'); // nome no título
const userNameNav     = document.getElementById('user-name-nav');     // nome na navbar
const userAvatar      = document.getElementById('user-avatar');       // inicial no avatar
const loginTimeEl     = document.getElementById('login-time');        // horário no card
const closeBannerBtn  = document.getElementById('close-banner');      // botão fechar banner
const logoutBtn       = document.getElementById('logout-btn');        // botão Sair

// ── Preenchimento dos dados do usuário ────────────────────────
if (rawUser) {
  try {
    // JSON.parse() converte a string JSON de volta para objeto JavaScript
    const user = JSON.parse(rawUser);

    // Extrai apenas o primeiro nome para um saudação mais amigável
    // ex: "Usuário Teste" → "Usuário"
    const firstName = user.name ? user.name.split(' ')[0] : 'Usuário';

    // Pega a primeira letra do nome para exibir no avatar circular
    // ex: "Usuário" → "U"
    const initial = firstName.charAt(0).toUpperCase();

    // Atualiza os elementos visuais com os dados reais do usuário
    userNameDisplay.textContent = firstName;       // ex: "Olá, Usuário! 👋"
    userNameNav.textContent     = user.name || 'Usuário'; // nome completo na navbar
    userAvatar.textContent      = initial;         // letra no círculo colorido
  } catch (_) {
    // Se o JSON estiver corrompido, ignora o erro silenciosamente
    // e a página exibirá os valores padrão definidos no HTML
  }
}

// ── Exibição do horário de login ──────────────────────────────
if (loginTime && loginTimeEl) {
  // Usa o horário que foi salvo no momento exato do login
  loginTimeEl.textContent = loginTime;
} else if (loginTimeEl) {
  // Fallback: se o horário não estiver disponível na sessão,
  // usa a hora atual como aproximação
  loginTimeEl.textContent = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  });
}

// ── 2. Fechar o banner de sucesso ────────────────────────────
/**
 * Quando o usuário clica no "X" do banner, ele some com uma
 * animação suave de fade + deslizamento para cima.
 * O operador "?." (optional chaining) evita erro caso o elemento
 * não exista no DOM por algum motivo.
 */
closeBannerBtn?.addEventListener('click', () => {
  const banner = document.getElementById('success-banner');
  if (banner) {
    // Define a transição CSS diretamente via JavaScript
    banner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    banner.style.opacity    = '0';         // começa a desaparecer
    banner.style.transform  = 'translateY(-8px)'; // sobe levemente

    // Após 300ms (duração da animação), oculta definitivamente o elemento
    setTimeout(() => { banner.hidden = true; }, 300);
  }
});

// ── 3. Logout ────────────────────────────────────────────────
/**
 * Ao clicar em "Sair", remove os dados de sessão armazenados
 * e redireciona para a página de login.
 *
 * sessionStorage.removeItem() elimina apenas as chaves específicas.
 * window.location.href força a navegação para a URL indicada.
 */
logoutBtn?.addEventListener('click', () => {
  // Remove os dados do usuário salvos durante o login
  sessionStorage.removeItem('authUser');
  sessionStorage.removeItem('loginTime');

  // Redireciona para a raiz "/" (página de login)
  window.location.href = '/';
});
