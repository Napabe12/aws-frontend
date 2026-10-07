export function renderLogin(container, onLoginSuccess) {
  container.innerHTML = `
    <div class="card">
      <h2>Iniciar Sesión</h2>
      <div id="error-box" style="display:none;" class="alert-error"></div>
      <form id="login-form">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input type="text" id="username" placeholder="admin" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" placeholder="••••••••" required />
        </div>
        <button type="submit" id="btn-submit">Ingresar</button>
      </form>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const errorBox = container.querySelector('#error-box');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const u = container.querySelector('#username').value.trim();
    const p = container.querySelector('#password').value;

    try {
      await onLoginSuccess(u, p);
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.style.display = 'block';
    }
  });
}