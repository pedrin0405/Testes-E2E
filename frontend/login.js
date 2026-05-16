// ============================================================
// frontend/login.js
// Responsabilidade: controlar todo o comportamento interativo
// da página de login (index.html).
//
// Funcionalidades implementadas:
//   1. Habilitar/desabilitar o botão "Entrar" dinamicamente
//   2. Validar os campos antes de enviar o formulário
//   3. Fazer a chamada HTTP para a API POST /login
//   4. Redirecionar para /home em caso de sucesso
//   5. Exibir mensagens de erro em caso de falha
// ============================================================

// ── URL base da API ───────────────────────────────────────────
// Centraliza o endereço do backend. Se a porta mudar,
// basta alterar aqui e todas as chamadas serão atualizadas.
const API_BASE = 'http://localhost:3001';

// ── Seleção de elementos do DOM ───────────────────────────────
// Capturamos referências para os elementos HTML que vamos
// manipular ao longo do script, usando seus atributos "id".

const emailInput    = document.getElementById('email');          // campo de e-mail
const passwordInput = document.getElementById('password');       // campo de senha
const loginBtn      = document.getElementById('login-btn');      // botão "Entrar"
const loginForm     = document.getElementById('login-form');     // o formulário completo
const alertSuccess  = document.getElementById('alert-success');  // banner de sucesso
const alertError    = document.getElementById('alert-error');    // banner de erro
const alertErrorTxt = document.getElementById('alert-error-text'); // texto do erro
const emailError    = document.getElementById('email-error');    // mensagem erro e-mail
const passwordError = document.getElementById('password-error'); // mensagem erro senha
const btnText       = document.getElementById('btn-text');       // texto do botão
const btnSpinner    = document.getElementById('btn-spinner');    // ícone de carregamento
const togglePwdBtn  = document.getElementById('toggle-password'); // botão "ver senha"

// ── 1. Controle do estado do botão ───────────────────────────
/**
 * updateButtonState()
 * Habilita o botão "Entrar" SOMENTE quando ambos os campos
 * estiverem preenchidos. Caso contrário, o botão fica
 * desabilitado (atributo disabled = true).
 *
 * O .trim() remove espaços em branco antes de checar,
 * impedindo que apenas espaços habilitem o botão.
 */
function updateButtonState() {
  const emailFilled    = emailInput.value.trim().length > 0;
  const passwordFilled = passwordInput.value.length > 0;

  // disabled = true  → botão desabilitado (cinza, não clicável)
  // disabled = false → botão habilitado (colorido, clicável)
  loginBtn.disabled = !(emailFilled && passwordFilled);
}

// Escuta o evento "input" no campo de e-mail.
// "input" dispara a cada tecla pressionada (diferente de "change"
// que só dispara ao sair do campo).
emailInput.addEventListener('input', () => {
  clearFieldError(emailInput, emailError); // apaga erro de validação anterior
  hideAlerts();                            // esconde alertas globais anteriores
  updateButtonState();                     // recalcula estado do botão
});

// Mesmo comportamento para o campo de senha
passwordInput.addEventListener('input', () => {
  clearFieldError(passwordInput, passwordError);
  hideAlerts();
  updateButtonState();
});

// ── 2. Toggle de visibilidade da senha ───────────────────────
/**
 * Alterna o tipo do campo de senha entre "password" (●●●●)
 * e "text" (texto visível) ao clicar no ícone do olho.
 */
togglePwdBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';

  // Inverte o tipo do campo
  passwordInput.type = isPassword ? 'text' : 'password';

  // Atualiza o rótulo de acessibilidade (leitores de tela)
  togglePwdBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
});

// ── Funções auxiliares ────────────────────────────────────────

/**
 * showAlert(el)
 * Torna um elemento de alerta visível e reinicia sua animação
 * CSS para que o efeito de entrada ocorra novamente.
 * @param {HTMLElement} el - elemento do alerta a exibir
 */
function showAlert(el) {
  el.hidden = false;

  // Força o reflow do navegador para reiniciar a animação CSS.
  // Sem isso, se o alerta já estivesse visível, a animação não repetiria.
  el.style.animation = 'none';
  void el.offsetWidth; // leitura que "força" o reflow
  el.style.animation = '';
}

/**
 * hideAlerts()
 * Oculta todos os alertas globais (sucesso e erro).
 * O atributo "hidden" remove o elemento do fluxo visual da página.
 */
function hideAlerts() {
  alertSuccess.hidden = true;
  alertError.hidden   = true;
}

/**
 * showFieldError(input, errorEl, msg)
 * Marca um campo como inválido e exibe sua mensagem de erro.
 * @param {HTMLInputElement} input   - campo de formulário
 * @param {HTMLElement}      errorEl - span da mensagem de erro
 * @param {string}           msg     - texto do erro a exibir
 */
function showFieldError(input, errorEl, msg) {
  input.classList.add('is-invalid'); // adiciona borda vermelha via CSS
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

/**
 * clearFieldError(input, errorEl)
 * Remove o estado de erro de um campo (borda vermelha + mensagem).
 * @param {HTMLInputElement} input   - campo de formulário
 * @param {HTMLElement}      errorEl - span da mensagem de erro
 */
function clearFieldError(input, errorEl) {
  input.classList.remove('is-invalid'); // remove borda vermelha
  errorEl.hidden = true;                // oculta a mensagem de erro
}

/**
 * setLoading(loading)
 * Controla o estado visual de carregamento do botão "Entrar".
 * Enquanto a requisição está em andamento:
 *   - o texto "Entrar" é ocultado
 *   - um spinner giratório é exibido
 *   - o botão fica desabilitado (evita duplo clique)
 * @param {boolean} loading - true para ativar, false para desativar
 */
function setLoading(loading) {
  loginBtn.disabled = loading;
  btnText.hidden    = loading;
  btnSpinner.hidden = !loading;
}

// ── 3. Validação do formulário ────────────────────────────────
/**
 * validateForm()
 * Verifica se os campos obrigatórios estão preenchidos.
 * Exibe as mensagens de erro individuais por campo se necessário.
 * @returns {boolean} true se válido, false se há algum erro
 */
function validateForm() {
  let valid = true;

  // Valida o campo e-mail
  if (!emailInput.value.trim()) {
    showFieldError(emailInput, emailError, 'O e-mail é obrigatório.');
    valid = false;
  }

  // Valida o campo senha
  if (!passwordInput.value) {
    showFieldError(passwordInput, passwordError, 'A senha é obrigatória.');
    valid = false;
  }

  return valid;
}

// ── 4. Submissão do formulário ────────────────────────────────
/**
 * Escuta o evento "submit" do formulário.
 * O e.preventDefault() impede o comportamento padrão do HTML
 * (que recarregaria a página), deixando o JavaScript assumir
 * o controle da submissão via fetch (chamada assíncrona).
 */
loginForm.addEventListener('submit', async (e) => {
  // Impede recarregamento da página
  e.preventDefault();

  // Limpa alertas anteriores antes de validar novamente
  hideAlerts();

  // Se a validação falhar, interrompe o fluxo aqui
  if (!validateForm()) return;

  // Ativa o estado de carregamento (spinner no botão)
  setLoading(true);

  try {
    // ── Chamada à API ────────────────────────────────────────
    // fetch() faz uma requisição HTTP assíncrona para o backend.
    // "await" pausa a execução até que a resposta chegue.
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',                          // método HTTP POST
      headers: { 'Content-Type': 'application/json' }, // informa que o corpo é JSON
      body: JSON.stringify({                   // converte objeto JS para string JSON
        email:    emailInput.value.trim(),     // e-mail sem espaços extras
        password: passwordInput.value,         // senha exatamente como digitada
      }),
    });

    // Converte o corpo da resposta de JSON para objeto JavaScript
    const data = await response.json();

    // ── Verificação da resposta ──────────────────────────────
    if (response.ok && data.success) {
      // ── Login bem-sucedido ─────────────────────────────────
      // response.ok = true quando o status HTTP é 2xx (ex: 200)

      // Salva os dados do usuário na sessionStorage para que a
      // página Home possa exibi-los sem uma nova chamada ao servidor.
      // sessionStorage: persiste apenas enquanto a aba do navegador
      // estiver aberta (diferente do localStorage que persiste mais).
      sessionStorage.setItem('authUser', JSON.stringify(data.user));

      // Salva a hora do login para exibir no card da Home
      sessionStorage.setItem('loginTime', new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }));

      // Exibe o alerta de sucesso brevemente antes do redirect
      showAlert(alertSuccess);

      // Redireciona para /home após 800ms (tempo suficiente para
      // o usuário ver a mensagem de sucesso)
      setTimeout(() => {
        window.location.href = '/home';
      }, 800);

    } else {
      // ── Login com falha (401 ou 400) ───────────────────────
      // Exibe a mensagem de erro retornada pelo servidor,
      // ou uma mensagem padrão se o servidor não enviou nenhuma.
      alertErrorTxt.textContent = data.message || 'Credenciais inválidas';
      showAlert(alertError);

      // Desativa o loading para que o usuário possa tentar novamente
      setLoading(false);
    }
  } catch (err) {
    // ── Erro de rede / servidor indisponível ───────────────────
    // O bloco catch captura erros como: servidor offline,
    // sem internet, timeout, etc.
    alertErrorTxt.textContent = 'Erro de conexão. Tente novamente.';
    showAlert(alertError);
    setLoading(false);
  }
});
