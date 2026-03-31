import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../utils/api';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // OAuth2 password flow requires form-encoded body
            const body = new URLSearchParams({ username, password });
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('admin_token', data.access_token);
                localStorage.setItem('admin_username', username);
                navigate('/admin/dashboard');
            } else {
                const err = await res.json();
                setError(err.detail || 'Credenciais inválidas');
            }
        } catch {
            setError('Erro de conexão. Verifique se o servidor está online.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">🌿 VivePlante</h1>
                <p className="text-center text-gray-500 mb-6 text-sm">Acesso Restrito — Administração</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Usuário</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
