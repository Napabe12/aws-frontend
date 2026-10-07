export async function loginRequest(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }
  return data;
}

export async function fetchDashboardData(token) {
  const response = await fetch('/api/dashboard/data', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Sesión expirada o token inválido');
  }
  return data;
}