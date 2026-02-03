import { useEffect, useState } from 'react';
import { api } from '../api';

export default function OAuth2Callback() {
  const [status, setStatus] = useState({ loading: true, error: '', success: '' });

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extrair parâmetros da URL (podem vir via hash: #/auth/callback?token=...&email=...)
        let params = new URLSearchParams(window.location.search);
        
        // Se não encontrou em search, tenta extrair da hash
        if (!params.get('token')) {
          const hashParts = window.location.hash.split('?');
          if (hashParts.length > 1) {
            params = new URLSearchParams(hashParts[1]);
          }
        }
        
        const token = params.get('token');
        const email = params.get('email');

        if (!token) {
          setStatus({ 
            loading: false, 
            error: '❌ Token não recebido. Tente fazer login novamente.', 
            success: '' 
          });
          return;
        }

        // Armazenar o token
        api.setToken(token);

        // Verificar se o token é válido
        const userData = await api.verifyOAuth2Token(token);

        if (!userData || !userData.token) {
          throw new Error('Dados do token inválidos');
        }

        // Normalizar dados do usuário
        const normalizedUser = {
          id: userData.id,
          nome: userData.nome || userData.name,
          email: userData.email,
          avatar: userData.fotoPerfil || userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.nome || userData.name || 'User')}&background=667eea&color=fff&size=150`,
          tipo: userData.tipo || userData.type || userData.role,
          telefone: userData.telefone || userData.phone || '',
          profissao: userData.profissao || userData.specialty || '',
          novoUsuario: userData.novoUsuario || false,
        };

        // Armazenar dados do usuário
        localStorage.setItem('slotyer_user', JSON.stringify(normalizedUser));

        setStatus({ loading: false, error: '', success: '✅ Login realizado com sucesso!' });

        // Redirecionar após 1 segundo
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);

      } catch (err) {
        let message = 'Erro ao processar login OAuth2';

        if (err.message === 'Failed to fetch' || err.message?.includes('ERR_NAME_NOT_RESOLVED')) {
          message = '❌ Servidor indisponível. Tente novamente.';
        } else if (err.status === 401 || err.status === 404) {
          message = '❌ Token inválido ou expirado. Tente fazer login novamente.';
        } else if (err.status) {
          message = err?.body?.message || `❌ Erro ${err.status}: Tente novamente`;
        } else if (err.message) {
          message = `❌ ${err.message}`;
        }

        setStatus({ loading: false, error: message, success: '' });
      }
    };

    handleCallback();
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
      }}>
        {status.loading && (
          <>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'spin 1s linear infinite',
            }}>
              ⏳
            </div>
            <h2>Processando login...</h2>
            <p style={{ color: '#666' }}>Por favor, aguarde.</p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}

        {status.error && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h2>Erro ao fazer login</h2>
            <p style={{ color: '#d32f2f', marginBottom: '20px' }}>{status.error}</p>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Voltar para Home
            </button>
          </>
        )}

        {status.success && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2>Login realizado!</h2>
            <p style={{ color: '#388e3c', marginBottom: '20px' }}>{status.success}</p>
            <p style={{ color: '#666' }}>Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  );
}
