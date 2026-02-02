const defaultBase = import.meta.env.VITE_API_BASE || 'https://slotyer-back-end.fly.dev';

async function request(method, path, { body, baseUrl = defaultBase } = {}) {
  const token = localStorage.getItem('slotyer_token');

  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = { method, headers };

  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}${path}`, opts);
  const text = await res.text();

  let data = null;
  if (text && text.length > 0) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && typeof data === 'object' && data.message) ? data.message : (typeof data === 'string' ? data : 'Request failed');
    const error = new Error(message);
    error.status = res.status;
    error.body = data;
    throw error;
  }

  return data;
}

export const api = {
  setBaseUrl(newBase) {
    if (newBase) {
      localStorage.setItem('slotyer_base_url', newBase);
    }
  },
  getBaseUrl() {
    return localStorage.getItem('slotyer_base_url') || defaultBase;
  },
  setToken(newToken) {
    if (newToken) {
      localStorage.setItem('slotyer_token', newToken);
    } else {
      localStorage.removeItem('slotyer_token');
    }
  },
  getToken() {
    return localStorage.getItem('slotyer_token');
  },
  // Autenticação
  register(payload) {
    return request('POST', '/api/auth/register', { body: payload, baseUrl: api.getBaseUrl() });
  },
  login(payload) {
    return request('POST', '/api/auth/login', { body: payload, baseUrl: api.getBaseUrl() });
  },
  // Usuários
  getMe() {
    return request('GET', '/api/usuarios/me', { baseUrl: api.getBaseUrl() });
  },
  deleteMe() {
    return request('DELETE', '/api/usuarios/me', { baseUrl: api.getBaseUrl() });
  },
  // Profissionais
  listProfissionais() {
    return request('GET', '/api/professionals', { baseUrl: api.getBaseUrl() });
  },
  getProfissional(id) {
    return request('GET', `/api/professionals/${id}`, { baseUrl: api.getBaseUrl() });
  },
  updateProfissional(id, payload) {
    return request('PUT', `/api/professionals/${id}`, { body: payload, baseUrl: api.getBaseUrl() });
  },
  getMyProfessionalProfile() {
    return request('GET', '/api/professionals/me', { baseUrl: api.getBaseUrl() });
  },
  updateMyProfessionalProfile(payload) {
    return request('PUT', '/api/professionals/me', { body: payload, baseUrl: api.getBaseUrl() });
  },
  // Serviços
  listServicos() {
    return request('GET', '/api/services', { baseUrl: api.getBaseUrl() });
  },
  listServicosDoProfissional(profissionalId) {
    return request('GET', `/api/services/professional/${profissionalId}`, { baseUrl: api.getBaseUrl() });
  },
  getServico(id) {
    return request('GET', `/api/services/${id}`, { baseUrl: api.getBaseUrl() });
  },
  createServico(payload) {
    return request('POST', '/api/services', { body: payload, baseUrl: api.getBaseUrl() });
  },
  updateServico(id, payload) {
    return request('PUT', `/api/services/${id}`, { body: payload, baseUrl: api.getBaseUrl() });
  },
  deleteServico(id) {
    return request('DELETE', `/api/services/${id}`, { baseUrl: api.getBaseUrl() });
  },
  // Horários
  listHorarios(profissionalId) {
    return request('GET', `/api/horarios/profissional/${profissionalId}`, { baseUrl: api.getBaseUrl() });
  },
  listHorariosDisponiveis(profissionalId) {
    return request('GET', `/api/horarios/profissional/${profissionalId}/disponiveis`, { baseUrl: api.getBaseUrl() });
  },
  listHorariosPorData(profissionalId, data) {
    return request('GET', `/api/horarios/profissional/${profissionalId}/data?data=${encodeURIComponent(data)}`, { baseUrl: api.getBaseUrl() });
  },
  getHorario(id) {
    return request('GET', `/api/horarios/${id}`, { baseUrl: api.getBaseUrl() });
  },
  createHorario(profissionalId, payload) {
    return request('POST', `/api/horarios/profissional/${profissionalId}`, { body: payload, baseUrl: api.getBaseUrl() });
  },
  updateHorario(id, payload) {
    return request('PUT', `/api/horarios/${id}`, { body: payload, baseUrl: api.getBaseUrl() });
  },
  deleteHorario(id) {
    return request('DELETE', `/api/horarios/${id}`, { baseUrl: api.getBaseUrl() });
  },
  // Agendamentos
  listMyAgendamentos() {
    return request('GET', '/api/bookings/my', { baseUrl: api.getBaseUrl() });
  },
  listAgendamentosProfissional() {
    return request('GET', '/api/bookings/professional/my', { baseUrl: api.getBaseUrl() });
  },
  listAgendamentosProfissionalPendentes() {
    return request('GET', '/api/bookings/professional/my/pending', { baseUrl: api.getBaseUrl() });
  },
  getAgendamento(id) {
    return request('GET', `/api/bookings/${id}`, { baseUrl: api.getBaseUrl() });
  },
  createAgendamento(payload) {
    return request('POST', '/api/bookings', { body: payload, baseUrl: api.getBaseUrl() });
  },
  confirmarAgendamento(id) {
    return request('PATCH', `/api/bookings/${id}/confirm`, { baseUrl: api.getBaseUrl() });
  },
  cancelarAgendamento(id) {
    return request('PATCH', `/api/bookings/${id}/cancel`, { baseUrl: api.getBaseUrl() });
  },
  // Pagamentos
  listMyPagamentos() {
    return request('GET', '/api/payments/my', { baseUrl: api.getBaseUrl() });
  },
  listPagamentosProfissional() {
    return request('GET', '/api/payments/professional/my', { baseUrl: api.getBaseUrl() });
  },
  getPagamento(id) {
    return request('GET', `/api/payments/${id}`, { baseUrl: api.getBaseUrl() });
  },
  getPagamentoPorAgendamento(agendamentoId) {
    return request('GET', `/api/payments/booking/${agendamentoId}`, { baseUrl: api.getBaseUrl() });
  },
  createPagamento(payload) {
    return request('POST', '/api/payments', { body: payload, baseUrl: api.getBaseUrl() });
  },
  processarPagamento(id) {
    return request('PATCH', `/api/payments/${id}/process`, { baseUrl: api.getBaseUrl() });
  },
  recusarPagamento(id) {
    return request('PATCH', `/api/payments/${id}/reject`, { baseUrl: api.getBaseUrl() });
  },
};
