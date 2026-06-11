// src/pages/Clientes.jsx
// Exibe clientes cadastrados no banco

import { clienteService } from "../services/api";
import { useFetch } from "../hooks/useFetch";

export default function Clientes() {
  const { data: clientes, loading, error, refetch } = useFetch(clienteService.listar);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
        <strong>Erro ao carregar clientes:</strong> {error}
        <button onClick={refetch} className="ml-4 underline hover:text-red-900">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!clientes?.length) {
    return (
      <div className="text-center text-gray-500 py-16">
        <p className="text-lg">Nenhum cliente cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-xl text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Nome</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Telefone</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {clientes.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-500">#{c.id}</td>
              <td className="px-4 py-3 font-medium text-gray-800">{c.nome}</td>
              <td className="px-4 py-3 text-gray-700">{c.email || "—"}</td>
              <td className="px-4 py-3 text-gray-700">{c.telefone || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
