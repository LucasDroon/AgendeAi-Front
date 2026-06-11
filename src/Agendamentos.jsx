// src/pages/Agendamentos.jsx
// Exibe os agendamentos vindos do banco via backend

import { useState } from "react";
import { agendamentoService } from "../services/api";
import { useFetch, useMutation } from "../hooks/useFetch";

export default function Agendamentos() {
  const {
    data: agendamentos,
    loading,
    error,
    refetch,
  } = useFetch(agendamentoService.listar);

  const { execute: remover, loading: removendo } = useMutation(
    agendamentoService.remover
  );

  const [removendoId, setRemovendoId] = useState(null);

  async function handleRemover(id) {
    if (!confirm("Deseja remover este agendamento?")) return;
    setRemovendoId(id);
    try {
      await remover(id);
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setRemovendoId(null);
    }
  }

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
        <strong>Erro ao carregar agendamentos:</strong> {error}
        <button
          onClick={refetch}
          className="ml-4 underline text-red-800 hover:text-red-900"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!agendamentos?.length) {
    return (
      <div className="text-center text-gray-500 py-16">
        <p className="text-lg">Nenhum agendamento encontrado.</p>
        <p className="text-sm mt-1">Crie o primeiro usando o botão acima.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-xl text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Cliente</th>
            <th className="px-4 py-3 text-left">Serviço</th>
            <th className="px-4 py-3 text-left">Data / Hora</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {agendamentos.map((ag) => (
            <tr key={ag.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-500">#{ag.id}</td>
              <td className="px-4 py-3 font-medium text-gray-800">
                {ag.cliente?.nome || ag.clienteNome || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {ag.servico?.nome || ag.servicoNome || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {ag.dataHora
                  ? new Date(ag.dataHora).toLocaleString("pt-BR")
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={ag.status} />
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => handleRemover(ag.id)}
                  disabled={removendoId === ag.id}
                  className="text-red-500 hover:text-red-700 text-xs disabled:opacity-40"
                >
                  {removendoId === ag.id ? "Removendo..." : "Remover"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDENTE: "bg-yellow-100 text-yellow-700",
    CONFIRMADO: "bg-green-100 text-green-700",
    CANCELADO: "bg-red-100 text-red-700",
    CONCLUIDO: "bg-blue-100 text-blue-700",
  };
  const cls = map[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status || "—"}
    </span>
  );
}
