// src/hooks/useFetch.js
// Hook genérico para buscar dados do backend com estados de carregamento e erro

import { useState, useEffect, useCallback } from "react";

/**
 * @param {Function} fetchFn  — função que retorna uma Promise (ex: agendamentoService.listar)
 * @param {Array}    deps     — dependências do useEffect (opcional)
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

/**
 * Hook para ações (POST, PUT, DELETE) com controle de estado
 */
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(...args);
        return result;
      } catch (err) {
        const message = err.message || "Erro ao executar operação.";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  return { execute, loading, error };
}
