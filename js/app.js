const API_URL = 'http://localhost:3000/api';

let tokenActual = localStorage.getItem('jwt_farmacia_token');
let usuarioActual = JSON.parse(localStorage.getItem('jwt_farmacia_user'));

const seccionAuth = document.getElementById('seccion-auth');
const seccionDashboard = document.getElementById('seccion-dashboard');
const formLogin = document.getElementById('form-login');
const formRegistro = document.getElementById('form-registro');
const btnLogout = document.getElementById('btn-logout');

const enlaceIrARegistro = document.getElementById('ir-a-registro');
const enlaceIrALogin = document.getElementById('ir-a-login');
const subtituloAuth = document.getElementById('subtitulo-auth');

// ALTERNAR ENTRE LOGIN Y CREAR USUARIO
enlaceIrARegistro.addEventListener('click', (e) => {
  e.preventDefault();
  formLogin.classList.add('oculto');
  formRegistro.classList.remove('oculto');
  subtituloAuth.innerText = "Crea tu cuenta de acceso";
});

enlaceIrALogin.addEventListener('click', (e) => {
  e.preventDefault();
  formRegistro.classList.add('oculto');
  formLogin.classList.remove('oculto');
  subtituloAuth.innerText = "Sistema Integral de Gestión y Control RBAC";
});

// NOTIFICACIÓN Y MODAL
function mostrarNotificacion(texto = "Operación exitosa") {
  const toast = document.getElementById('toast-notificacion');
  const txt = document.getElementById('toast-mensaje');
  txt.innerText = texto;
  toast.classList.remove('oculto');
  
  setTimeout(() => {
    toast.classList.add('oculto');
  }, 3000);
}

function abrirModalConfirmacion({ titulo, mensaje, onConfirmar }) {
  const modal = document.getElementById('modal-confirm');
  const txtTitulo = document.getElementById('modal-titulo');
  const txtMensaje = document.getElementById('modal-mensaje');
  const btnConfirmar = document.getElementById('btn-modal-confirmar');
  const btnCancelar = document.getElementById('btn-modal-cancelar');

  txtTitulo.innerText = titulo;
  txtMensaje.innerText = mensaje;
  modal.classList.remove('oculto');

  const nuevoConfirmar = btnConfirmar.cloneNode(true);
  const nuevoCancelar = btnCancelar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(nuevoConfirmar, btnConfirmar);
  btnCancelar.parentNode.replaceChild(nuevoCancelar, btnCancelar);

  nuevoCancelar.addEventListener('click', () => {
    modal.classList.add('oculto');
  });

  nuevoConfirmar.addEventListener('click', async () => {
    modal.classList.add('oculto');
    await onConfirmar();
  });
}

// INICIALIZACIÓN
if (tokenActual && usuarioActual) {
  cargarDashboard();
} else {
  mostrarLogin();
}

// INICIAR SESIÓN
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al autenticar');

    localStorage.setItem('jwt_farmacia_token', data.token);
    localStorage.setItem('jwt_farmacia_user', JSON.stringify(data.usuario));
    tokenActual = data.token;
    usuarioActual = data.usuario;

    cargarDashboard();
  } catch (err) {
    alert(err.message);
  }
});

// REGISTRO DE NUEVO USUARIO
formRegistro.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-pass').value;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al registrar usuario');

    localStorage.setItem('jwt_farmacia_token', data.token);
    localStorage.setItem('jwt_farmacia_user', JSON.stringify(data.usuario));
    tokenActual = data.token;
    usuarioActual = data.usuario;

    mostrarNotificacion("¡Cuenta creada con éxito!");
    cargarDashboard();
  } catch (err) {
    alert(err.message);
  }
});

btnLogout.addEventListener('click', () => {
  localStorage.removeItem('jwt_farmacia_token');
  localStorage.removeItem('jwt_farmacia_user');
  tokenActual = null;
  usuarioActual = null;
  mostrarLogin();
});

function mostrarLogin() {
  seccionAuth.classList.remove('oculto');
  seccionDashboard.classList.add('oculto');
  formRegistro.classList.add('oculto');
  formLogin.classList.remove('oculto');
  subtituloAuth.innerText = "Sistema Integral de Gestión y Control RBAC";
}

function cargarDashboard() {
  seccionAuth.classList.add('oculto');
  seccionDashboard.classList.remove('oculto');

  document.getElementById('txt-usuario').innerText = usuarioActual.nombre;
  document.getElementById('badge-rol').innerText = usuarioActual.rol;

  const tabUsuarios = document.getElementById('tab-btn-usuarios');
  const areaNuevoMed = document.getElementById('area-nuevo-med');

  if (usuarioActual.rol === 'admin') {
    tabUsuarios.classList.remove('oculto');
    areaNuevoMed.classList.remove('oculto');
    cargarUsuarios();
  } else if (usuarioActual.rol === 'farmaceutico') {
    tabUsuarios.classList.add('oculto');
    areaNuevoMed.classList.remove('oculto');
  } else {
    // Cliente
    tabUsuarios.classList.add('oculto');
    areaNuevoMed.classList.add('oculto');
  }

  cambiarTab('inventario');
  cargarMedicamentos();
}

function cambiarTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
  document.querySelectorAll('.contenido-tab').forEach(c => c.classList.add('oculto'));

  if (tab === 'inventario') {
    document.querySelector('.tab-btn:nth-child(1)').classList.add('activo');
    document.getElementById('modulo-inventario').classList.remove('oculto');
  } else if (tab === 'usuarios') {
    document.getElementById('tab-btn-usuarios').classList.add('activo');
    document.getElementById('modulo-usuarios').classList.remove('oculto');
  }
}

// INVENTARIO
async function cargarMedicamentos() {
  try {
    const res = await fetch(`${API_URL}/medicamentos`, {
      headers: { 'Authorization': `Bearer ${tokenActual}` }
    });
    const meds = await res.json();
    const tbody = document.getElementById('lista-medicamentos');
    tbody.innerHTML = '';

    meds.forEach(m => {
      const tr = document.createElement('tr');
      const puedeEliminar = usuarioActual.rol === 'admin';

      tr.innerHTML = `
        <td><strong>${m.codigo}</strong></td>
        <td>${m.nombre}</td>
        <td>${m.categoria}</td>
        <td>${m.stock} unidades</td>
        <td>$${m.precio.toFixed(2)}</td>
        <td>
          <span class="${m.requiereReceta ? 'tag-receta' : 'tag-libre'}">
            ${m.requiereReceta ? 'Receta Obligatoria' : 'Venta Libre'}
          </span>
        </td>
        <td>
          ${puedeEliminar ? `<button class="btn-peligro" onclick="eliminarMedicamento(${m.id})">Eliminar</button>` : '<small>Solo Lectura</small>'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error al cargar medicamentos:', err);
  }
}

document.getElementById('form-nuevo-med').addEventListener('submit', async (e) => {
  e.preventDefault();

  const categoriaTexto = document.getElementById('med-categoria').value.toLowerCase();
  const requiereRecetaDetectado = document.getElementById('med-receta').checked ||
                                 categoriaTexto.includes('antibiot') ||
                                 categoriaTexto.includes('controlad');

  const nuevo = {
    codigo: document.getElementById('med-codigo').value,
    nombre: document.getElementById('med-nombre').value,
    categoria: document.getElementById('med-categoria').value,
    stock: document.getElementById('med-stock').value,
    precio: document.getElementById('med-precio').value,
    requiereReceta: requiereRecetaDetectado
  };

  try {
    const res = await fetch(`${API_URL}/medicamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenActual}`
      },
      body: JSON.stringify(nuevo)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje);

    e.target.reset();
    mostrarNotificacion("Medicamento agregado");
    cargarMedicamentos();
  } catch (err) {
    alert(err.message);
  }
});

async function eliminarMedicamento(id) {
  abrirModalConfirmacion({
    titulo: "¿Eliminar Medicamento?",
    mensaje: "El fármaco será retirado permanentemente del catálogo e inventario.",
    onConfirmar: async () => {
      try {
        const res = await fetch(`${API_URL}/medicamentos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${tokenActual}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.mensaje);

        mostrarNotificacion("Eliminado con éxito");
        cargarMedicamentos();
      } catch (err) {
        alert(err.message);
      }
    }
  });
}

// GESTIÓN DE USUARIOS (ADMIN)
async function cargarUsuarios() {
  try {
    const res = await fetch(`${API_URL}/usuarios`, {
      headers: { 'Authorization': `Bearer ${tokenActual}` }
    });
    const usuarios = await res.json();
    const tbody = document.getElementById('lista-usuarios');
    tbody.innerHTML = '';

    usuarios.forEach(u => {
      const tr = document.createElement('tr');
      const esPropio = u.id === usuarioActual.id;

      tr.innerHTML = `
        <td>${u.id}</td>
        <td><strong>${u.nombre}</strong></td>
        <td>${u.email}</td>
        <td><span class="badge-rol">${u.rol}</span></td>
        <td>
          ${!esPropio ? `<button class="btn-peligro" onclick="eliminarUsuario(${u.id})">Eliminar</button>` : '<small>(Tu Cuenta)</small>'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando usuarios:', err);
  }
}

document.getElementById('form-nuevo-usuario').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nuevo = {
    nombre: document.getElementById('usr-nombre').value,
    email: document.getElementById('usr-email').value,
    password: document.getElementById('usr-pass').value,
    rol: document.getElementById('usr-rol').value
  };

  try {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenActual}`
      },
      body: JSON.stringify(nuevo)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje);

    e.target.reset();
    mostrarNotificacion("Usuario registrado");
    cargarUsuarios();
  } catch (err) {
    alert(err.message);
  }
});

async function eliminarUsuario(id) {
  abrirModalConfirmacion({
    titulo: "¿Eliminar Usuario?",
    mensaje: "Se revocarán inmediatamente todos los accesos y privilegios de esta cuenta.",
    onConfirmar: async () => {
      try {
        const res = await fetch(`${API_URL}/usuarios/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${tokenActual}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.mensaje);

        mostrarNotificacion("Usuario eliminado con éxito");
        cargarUsuarios();
      } catch (err) {
        alert(err.message);
      }
    }
  });
}