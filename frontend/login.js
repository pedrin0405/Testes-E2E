const API_BASE = 'http://localhost:3001';

const emailInput    = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn      = document.getElementById('login-btn');
const loginForm     = document.getElementById('login-form');
const alertSuccess  = document.getElementById('alert-success');
const alertError    = document.getElementById('alert-error');
const alertErrorTxt = document.getElementById('alert-error-text');
const emailError    = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const btnText       = document.getElementById('btn-text');
const btnSpinner    = document.getElementById('btn-spinner');
const togglePwdBtn  = document.getElementById('toggle-password');

function updateButtonState() {
  const emailFilled    = emailInput.value.trim().length > 0;
  const passwordFilled = passwordInput.value.length > 0;
  loginBtn.disabled = !(emailFilled && passwordFilled);
}

emailInput.addEventListener('input', () => {
  clearFieldError(emailInput, emailError);
  hideAlerts();
  updateButtonState();
});

passwordInput.addEventListener('input', () => {
  clearFieldError(passwordInput, passwordError);
  hideAlerts();
  updateButtonState();
});

togglePwdBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePwdBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
});

function showAlert(el) {
  el.hidden = false;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
}

function hideAlerts() {
  alertSuccess.hidden = true;
  alertError.hidden   = true;
}

function showFieldError(input, errorEl, msg) {
  input.classList.add('is-invalid');
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function clearFieldError(input, errorEl) {
  input.classList.remove('is-invalid');
  errorEl.hidden = true;
}

function setLoading(loading) {
  loginBtn.disabled = loading;
  btnText.hidden    = loading;
  btnSpinner.hidden = !loading;
}

function validateForm() {
  let valid = true;

  if (!emailInput.value.trim()) {
    showFieldError(emailInput, emailError, 'O e-mail é obrigatório.');
    valid = false;
  }

  if (!passwordInput.value) {
    showFieldError(passwordInput, passwordError, 'A senha é obrigatória.');
    valid = false;
  }

  return valid;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlerts();

  if (!validateForm()) return;

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      sessionStorage.setItem('authUser', JSON.stringify(data.user));
      sessionStorage.setItem('loginTime', new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }));

      showAlert(alertSuccess);

      setTimeout(() => {
        window.location.href = '/home';
      }, 800);
    } else {
      alertErrorTxt.textContent = data.message || 'Credenciais inválidas';
      showAlert(alertError);
      setLoading(false);
    }
  } catch (err) {
    alertErrorTxt.textContent = 'Erro de conexão. Tente novamente.';
    showAlert(alertError);
    setLoading(false);
  }
});
