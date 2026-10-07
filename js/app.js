import { loginRequest, fetchDashboardData } from './api.js';
import { renderLogin } from './components/login.js';
import { renderDashboard } from './components/dashboard.js';

const app = document.getElementById('app');

async function init() {
  const token = localStorage.getItem('jwt_token');

  if (token) {
    try {
      const data = await fetchDashboardData(token);
      renderDashboard(app, data, handleLogout);
      return;
    } catch {
      localStorage.removeItem('jwt_token');
    }
  }

  renderLogin(app, handleLogin);
}

async function handleLogin(username, password) {
  const result = await loginRequest(username, password);
  localStorage.setItem('jwt_token', result.token);
  init();
}

function handleLogout() {
  localStorage.removeItem('jwt_token');
  init();
}

init();