const defaultBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

async function request(method, path, { body, baseUrl = defaultBase } = {}) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}${path}`, opts);
  const text = await res.text();
  const hasBody = text.length > 0;
  const data = hasBody ? JSON.parse(text) : null;

  if (!res.ok) {
    const error = new Error('Request failed');
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
  // Serviços
  listServicos() {
    return request('GET', '/api/servicos', { baseUrl: api.getBaseUrl() });
  },
  listServicosDoProfissional(profissionalId) {
    return request('GET', `/api/servicos/profissional/${profissionalId}`, { baseUrl: api.getBaseUrl() });
  },
  getServico(id) {
    return request('GET', `/api/servicos/${id}`, { baseUrl: api.getBaseUrl() });
  },
  createServico(profissionalId, payload) {
    return request('POST', `/api/servicos/profissional/${profissionalId}`, { body: payload, baseUrl: api.getBaseUrl() });
  },
  updateServico(id, payload) {
    return request('PUT', `/api/servicos/${id}`, { body: payload, baseUrl: api.getBaseUrl() });
  },
  deleteServico(id) {
    return request('DELETE', `/api/servicos/${id}`, { baseUrl: api.getBaseUrl() });
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
  listAgendamentosCliente(clienteId) {
    return request('GET', `/api/agendamentos/cliente/${clienteId}`, { baseUrl: api.getBaseUrl() });
  },
  listAgendamentosProfissional(profissionalId) {
    return request('GET', `/api/agendamentos/profissional/${profissionalId}`, { baseUrl: api.getBaseUrl() });
  },
  listAgendamentosProfissionalPendentes(profissionalId) {
    return request('GET', `/api/agendamentos/profissional/${profissionalId}/pendentes`, { baseUrl: api.getBaseUrl() });
  },
  getAgendamento(id) {
    return request('GET', `/api/agendamentos/${id}`, { baseUrl: api.getBaseUrl() });
  },
  createAgendamento(clienteId, payload) {
    return request('POST', `/api/agendamentos/cliente/${clienteId}`, { body: payload, baseUrl: api.getBaseUrl() });
  },
  confirmarAgendamento(id) {
    return request('PATCH', `/api/agendamentos/${id}/confirmar`, { baseUrl: api.getBaseUrl() });
  },
  cancelarAgendamento(id) {
    return request('PATCH', `/api/agendamentos/${id}/cancelar`, { baseUrl: api.getBaseUrl() });
  },
  // Pagamentos
  listPagamentosCliente(clienteId) {
    return request('GET', `/api/pagamentos/cliente/${clienteId}`, { baseUrl: api.getBaseUrl() });
  },
  listPagamentosProfissional(profissionalId) {
    return request('GET', `/api/pagamentos/profissional/${profissionalId}`, { baseUrl: api.getBaseUrl() });
  },
  getPagamento(id) {
    return request('GET', `/api/pagamentos/${id}`, { baseUrl: api.getBaseUrl() });
  },
  getPagamentoPorAgendamento(agendamentoId) {
    return request('GET', `/api/pagamentos/agendamento/${agendamentoId}`, { baseUrl: api.getBaseUrl() });
  },
  createPagamento(payload) {
    return request('POST', '/api/pagamentos', { body: payload, baseUrl: api.getBaseUrl() });
  },
  processarPagamento(id) {
    return request('PATCH', `/api/pagamentos/${id}/processar`, { baseUrl: api.getBaseUrl() });
  },
  recusarPagamento(id) {
    return request('PATCH', `/api/pagamentos/${id}/recusar`, { baseUrl: api.getBaseUrl() });
  },
  // Autenticação
  signupProfissional(payload) {
    return request('POST', '/api/auth/signup', { body: payload, baseUrl: api.getBaseUrl() });
  },
  // Conteúdo público
  listDepoimentos() {
    return request('GET', '/api/depoimentos', { baseUrl: api.getBaseUrl() });
  },
  listFaqs() {
    return request('GET', '/api/faqs', { baseUrl: api.getBaseUrl() });
  },
};
