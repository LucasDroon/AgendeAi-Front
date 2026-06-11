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
  }),
  usuario: (u) => ({
    ...u,
    id: u.id_usuario,
    name: u.nome,
  }),
  agendamento: (a) => ({
    ...a,
    id: a.id_agendamento,
  })
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

  return data;
}

export const authService = {
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
};

export const agendamentoService = {
  listar: () => request("/agendamentos"),
  buscarPorId: (id) => request(`/agendamentos/${id}`),
  criar: (data) => request("/agendamentos", { method: "POST", body: JSON.stringify({ ...data, id_cliente: data.client, nome: data.client }) }), // Ajuste de nomeclatura simplificado
  atualizar: (id, data) => request(`/agendamentos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remover: (id) => request(`/agendamentos/${id}`, { method: "DELETE" }),
};

export const clienteService = {
  listar: () => request("/clientes"),
  buscarPorId: (id) => request(`/clientes/${id}`),
  criar: (data) => request("/clientes", { method: "POST", body: JSON.stringify({ ...data, nome: data.name, telefone: data.phone }) }),
  atualizar: (id, data) => request(`/clientes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remover: (id) => request(`/clientes/${id}`, { method: "DELETE" }),
};

export const servicoService = {
  listar: () => request("/servicos"),
  buscarPorId: (id) => request(`/servicos/${id}`),
  criar: (data) => request("/servicos", { method: "POST", body: JSON.stringify({ ...data, nome: data.label }) }),
  atualizar: (id, data) => request(`/servicos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remover: (id) => request(`/servicos/${id}`, { method: "DELETE" }),
};

export const usuarioService = {
  listar: () => request("/usuarios"),
  perfil: () => request("/usuarios/me"),
  atualizar: (id, data) => request(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

export default request;
