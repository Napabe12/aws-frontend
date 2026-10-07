export function renderDashboard(container, data, onLogout) {
  container.innerHTML = `
    <div class="card">
      <h2>Dashboard Protegido</h2>
      <div class="info-item"><strong>Usuario:</strong> <span>${data.usuario}</span></div>
      <div class="info-item"><strong>Rol:</strong> ${data.rol}</div>
      <div class="info-item"><strong>Estado:</strong> ${data.mensaje}</div>
      <div class="info-item"><strong>Seguridad:</strong> ${data.arquitectura}</div>
      <div class="info-item"><strong>Hora del servidor:</strong> ${new Date(data.timestamp).toLocaleTimeString()}</div>
      <button id="btn-logout" class="btn-danger">Cerrar Sesión</button>
    </div>
  `;

  container.querySelector('#btn-logout').addEventListener('click', onLogout);
}