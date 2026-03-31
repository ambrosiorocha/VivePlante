import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, MessageCircle } from 'lucide-react';

export default function Cart() {
    const { items, removeItem, total, clearCart } = useCart();
    const { clientId, clientName, clientPhone, clientCity } = useAuth();
    const settings = useSettings();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!clientId) {
            navigate('/cadastro');
            return;
        }

        setLoading(true);
        try {
            const quotePayload = {
                customer_id: clientId,
                customer_name: clientName || "Cliente",
                phone: clientPhone || "",
                city: clientCity || "",
                items: items.map(i => ({ product_id: i.id, quantity: i.quantity }))
            };

            const response = await fetch('http://localhost:8000/quotes/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quotePayload)
            });
            const data = await response.json();

            if (response.ok) {
                const text = `Olá! Gostaria de solicitar um orçamento (Ref: #${data.quote_id}).\n\nItens:\n${items.map(i => `- ${i.quantity}x ${i.name}`).join('\n')}\n\nNome: ${clientName}\nCidade: ${clientCity}`;
                const url = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
                clearCart();
                navigate('/catalogo');
            } else {
                alert('Erro ao criar orçamento: ' + (data.detail || 'Tente novamente'));
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4 text-gray-700">Seu carrinho está vazio</h1>
                <Link to="/catalogo" className="text-green-600 hover:underline font-medium">← Voltar ao catálogo</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6 text-green-800">Carrinho de Orçamento</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-4 border-b last:border-0">
                        <div className="flex items-center gap-4">
                            {item.image_url && <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />}
                            <div>
                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.quantity} un.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-green-700">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                            </span>
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <span className="font-bold text-gray-700">Total Estimado:</span>
                    <span className="text-xl font-bold text-green-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </span>
                </div>
            </div>

            {clientId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                    Orçamento para: <strong>{clientName}</strong> · {clientCity}
                </div>
            )}

            <div className="flex justify-end gap-3">
                <Link to="/catalogo" className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700">
                    Continuar Comprando
                </Link>
                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-semibold transition"
                >
                    <MessageCircle className="w-5 h-5" />
                    {loading ? 'Processando...' : 'Solicitar via WhatsApp'}
                </button>
            </div>
        </div>
    );
}
