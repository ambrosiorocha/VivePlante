import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({ name: '', phone: '', city: '', address: '', email: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/public/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (response.ok) {
                register(data.client_id, formData.name, formData.phone, formData.city);
                alert(data.message);
                navigate('/catalogo');
            } else {
                alert('Erro ao cadastrar');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-green-800 text-center">Cadastro Rápido</h1>
            <p className="text-center text-gray-600 mb-6">Cadastre-se para ver os preços e solicitar orçamentos.</p>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                    <input type="text" required className="w-full border p-2 rounded"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp *</label>
                    <input type="tel" required className="w-full border p-2 rounded" placeholder="(XX) 99999-9999"
                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade *</label>
                    <input type="text" required className="w-full border p-2 rounded"
                        value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço (Opcional)</label>
                    <input type="text" className="w-full border p-2 rounded"
                        value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50">
                    {loading ? 'Cadastrando...' : 'Ver Preços'}
                </button>
            </form>
        </div>
    );
}
