const rawUser   = sessionStorage.getItem('authUser');
const loginTime = sessionStorage.getItem('loginTime');

const userNameDisplay = document.getElementById('user-name-display');
const userNameNav     = document.getElementById('user-name-nav');
const userAvatar      = document.getElementById('user-avatar');
const loginTimeEl     = document.getElementById('login-time');
const closeBannerBtn  = document.getElementById('close-banner');
const logoutBtn       = document.getElementById('logout-btn');

if (rawUser) {
  try {
    const user = JSON.parse(rawUser);
    const firstName = user.name ? user.name.split(' ')[0] : 'Usuário';
    const initial   = firstName.charAt(0).toUpperCase();

    userNameDisplay.textContent = firstName;
    userNameNav.textContent     = user.name || 'Usuário';
    userAvatar.textContent      = initial;
  } catch (_) {
    /* ignore */
  }
}

if (loginTime && loginTimeEl) {
  loginTimeEl.textContent = loginTime;
} else if (loginTimeEl) {
  loginTimeEl.textContent = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  });
}

closeBannerBtn?.addEventListener('click', () => {
  const banner = document.getElementById('success-banner');
  if (banner) {
    banner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    banner.style.opacity    = '0';
    banner.style.transform  = 'translateY(-8px)';
    setTimeout(() => { banner.hidden = true; }, 300);
  }
});

logoutBtn?.addEventListener('click', () => {
  sessionStorage.removeItem('authUser');
  sessionStorage.removeItem('loginTime');
  window.location.href = '/';
});
