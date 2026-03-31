import { useEffect, useState } from 'react';
import { authFetch } from '../../utils/api';
// import { format } from 'date-fns'; // Removed to avoid dependency

interface Quote {
    id: number;
    customer_name: string;
    status: string;
    created_at: string;
    total_estimated?: number; // fetched manually or assumed for list
}

export default function Quotes() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuotes = () => {
        authFetch('/quotes/')
            .then(r => r.json())
            .then(data => {
                setQuotes(data);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const convertToSale = async (id: number) => {
        if (!confirm('Confirma converter este orçamento em venda? O estoque será baixado.')) return;

        try {
            const res = await authFetch(`/quotes/${id}/convert`, { method: 'POST' });
            if (res.ok) {
                alert('Convertido com sucesso!');
                fetchQuotes();
            } else {
                const err = await res.json();
                if (res.status === 409 && err.detail?.items) {
                    const itemLines = err.detail.items
                        .map((i: { product_name: string; requested: number; available: number }) =>
                            `• ${i.product_name}: solicitado ${i.requested}, disponível ${i.available}`)
                        .join('\n');
                    alert(`Estoque insuficiente:\n${itemLines}`);
                } else {
                    alert('Erro: ' + (err.detail?.message || err.detail || 'Falha na conversão'));
                }
            }
        } catch (e) {
            alert('Erro de conexão');
        }
    };

    if (loading) return <div className="p-8">Carregando orçamentos...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Gerenciar Orçamentos</h1>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700">#</th>
                            <th className="p-4 font-semibold text-gray-700">Cliente</th>
                            <th className="p-4 font-semibold text-gray-700">Data</th>
                            <th className="p-4 font-semibold text-gray-700">Status</th>
                            <th className="p-4 font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {quotes.map(quote => (
                            <tr key={quote.id} className="hover:bg-gray-50">
                                <td className="p-4">#{quote.id}</td>
                                <td className="p-4 font-medium">{quote.customer_name}</td>
                                <td className="p-4 text-gray-500">{new Date(quote.created_at).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${quote.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        quote.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {quote.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {quote.status === 'PENDING' && (
                                        <button onClick={() => convertToSale(quote.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            Converter em Venda
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
