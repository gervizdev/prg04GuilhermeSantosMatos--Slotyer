import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { handleUserUpdate, handleLogout } = useAuth();

  const updateUser = async (payload, options = {}) => {
    const { onSuccess, onError, forceReload = true } = options;

    // Validação básica do payload
    if (!payload || typeof payload !== 'object') {
      const msg = 'Payload inválido para atualização';
      setError(msg);
      if (onError) onError(new Error(msg));
      return false;
    }

    // Validação específica para tipo
    if (payload.tipo && !['CLIENTE', 'PROFISSIONAL'].includes(payload.tipo)) {
      const msg = 'Tipo de usuário inválido. Deve ser CLIENTE ou PROFISSIONAL';
      setError(msg);
      if (onError) onError(new Error(msg));
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const updated = await api.updateMe(payload);

      // Após sucesso, recarregar dados do usuário para garantir consistência
      let finalUser = updated;
      if (forceReload) {
        try {
          finalUser = await api.getMe();
        } catch (reloadErr) {
          console.warn('Falha ao recarregar dados do usuário após update:', reloadErr);
          // Continua com os dados retornados pelo update
        }
      }

      // Atualizar contexto
      handleUserUpdate(finalUser);

      if (onSuccess) onSuccess(finalUser);
      return true;
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);

      // Tratamento específico para erros que indicam mudança de sessão/ID
      if (err.status === 500 ||
          err.status === 401 ||
          err.message?.toLowerCase().includes('id') ||
          err.message?.toLowerCase().includes('session') ||
          err.message?.toLowerCase().includes('token')) {
        // Forçar re-login
        api.setToken(null);
        handleLogout();
        const msg = 'Sessão expirada ou conta alterada. Faça login novamente.';
        setError(msg);
        if (onError) onError(new Error(msg));
        // Redirecionar para login (assumindo que o componente pai lida com navegação)
        window.location.href = '/login';
        return false;
      }

      const msg = err.message || 'Erro ao atualizar usuário';
      setError(msg);
      if (onError) onError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading, error };
};