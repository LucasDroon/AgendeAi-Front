// src/services/api.js
// Camada central de comunicação com o backend hospedado no Render
// const BASE_URL = import.meta.env.VITE_API_URL || "https://agendeai.onrender.com";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Adaptadores para normalizar dados do backend para o formato esperado pelo front
 */
const adapt = {
  cliente: (c) => ({
    ...c,
    id: c.id_cliente,
    name: c.nome,
    phone: c.telefone,
  }),
  servico: (s) => ({
    ...s,
    id: s.id_servico,
    name: s.nome,
    label: s.nome,
    price: s.preco,
    duration: s.duracao_estimada,
    commission: s.percentual_comissao,
  }),
  usuario: (u) => ({
    ...u,
    id: u.id_profissional || u.id_usuario,
    name: u.nome,
    commission: u.percentual_comissao,
  }),
  agendamento: (a) => ({
    ...a,
    id: a.id_agendamento,
  }),
  profissional: (p) => ({
    ...p,
    id: p.id_profissional,
    name: p.nome,
    commission: p.percentual_comissao,
  })
};

const toBackend = {
  cliente: (c) => ({
    nome: c.name,
    telefone: c.phone,
    email: c.email,
    data_nascimento: c.dob,
  }),
  servico: (s) => ({
    nome: s.label,
    preco: s.price,
    duracao_estimada: s.duration,
    percentual_comissao: s.commission,
  }),
  profissional: (p) => ({
    nome: p.name,
    percentual_comissao: p.commission,
    telefone: p.phone,
    role: p.role,
    // Especialidades seriam tratadas aqui se necessário
  }),
};

/**
 * Faz uma requisição autenticada ao backend.
 */
async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    // Se for 403, logamos e retornamos erro amigável para não quebrar a UI
    if (response.status === 403) {
        console.error(`Acesso negado ao recurso: ${path}`);
        throw new Error("Você não tem permissão para acessar este recurso.");
    }

    let errorMessage = `Erro ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;

  const data = await response.json();

  // Aplica adaptação automática baseada na rota
  if (path.includes("/clientes")) return Array.isArray(data) ? data.map(adapt.cliente) : adapt.cliente(data);
  if (path.includes("/servicos")) return Array.isArray(data) ? data.map(adapt.servico) : adapt.servico(data);
  if (path.includes("/usuarios")) return Array.isArray(data) ? data.map(adapt.usuario) : adapt.usuario(data);
  if (path.includes("/agendamentos")) return Array.isArray(data) ? data.map(adapt.agendamento) : adapt.agendamento(data);
  if (path.includes("/profissionais")) return Array.isArray(data) ? data.map(adapt.profissional) : adapt.profissional(data);

  return data;
}

export const authService = {
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
};

export const agendamentoService = {
  listar: () => request("/agendamentos"),
  buscarPorId: (id) => request(`/agendamentos/${id}`),
  criar: (data) => request("/agendamentos", { method: "POST", body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/agendamentos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remover: (id) => request(`/agendamentos/${id}`, { method: "DELETE" }),
};

export const clienteService = {
  listar: () => request("/clientes"),
  buscarPorId: (id) => request(`/clientes/${id}`),
  criar: (data) => request("/clientes", { method: "POST", body: JSON.stringify(toBackend.cliente(data)) }),
  atualizar: (id, data) => request(`/clientes/${id}`, { method: "PUT", body: JSON.stringify(toBackend.cliente(data)) }),
  remover: (id) => request(`/clientes/${id}`, { method: "DELETE" }),
};

export const servicoService = {
  listar: () => request("/servicos"),
  buscarPorId: (id) => request(`/servicos/${id}`),
  criar: (data) => request("/servicos", { method: "POST", body: JSON.stringify(toBackend.servico(data)) }),
  atualizar: (id, data) => request(`/servicos/${id}`, { method: "PUT", body: JSON.stringify(toBackend.servico(data)) }),
  remover: (id) => request(`/servicos/${id}`, { method: "DELETE" }),
};

export const usuarioService = {
  listar: () => request("/usuarios"),
  perfil: () => request("/usuarios/me"),
  atualizar: (id, data) => request(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

export const profissionalService = {
  listar: () => request("/profissionais"),
  buscarPorId: (id) => request(`/profissionais/${id}`),
  criar: (data) => request("/profissionais", { method: "POST", body: JSON.stringify(toBackend.profissional(data)) }),
  atualizar: (id, data) => request(`/profissionais/${id}`, { method: "PUT", body: JSON.stringify(toBackend.profissional(data)) }),
  inativar: (id) => request(`/profissionais/${id}/inativar`, { method: "PATCH" }),
};

export default request;
