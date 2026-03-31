import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash, X, History, ShoppingBag, Pencil, ClipboardList } from 'lucide-react';
import { authFetch } from '../../utils/api';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
}

interface SaleHistoryItem {
    id: number;
    date: string;
    total_amount: number;
    payment_method: string;
    status: string;
    items: { product_name: string; quantity: number; unit_price: number }[];
}

interface ClientHistory {
    client: { id: number; name: string; email: string; phone: string };
    sales: SaleHistoryItem[];
    total_spent: number;
    total_purchases: number;
}

const BRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const emptyForm = { name: '', email: '', phone: '', address: '' };

export default function Clients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [historyClient, setHistoryClient] = useState<ClientHistory | null>(null);
    const [clientQuotes, setClientQuotes] = useState<any[]>([]);
    const [historyTab, setHistoryTab] = useState<'compras' | 'pedidos'>('pedidos');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingCount, setPendingCount] = useState<Record<number, number>>({});

    // Finalization modal
    const [finalizeQuoteId, setFinalizeQuoteId] = useState<number | null>(null);
    const [finalizePayment, setFinalizePayment] = useState('Dinheiro');
    const [finalizeDiscount, setFinalizeDiscount] = useState(0);
    const [finalizeDelivery, setFinalizeDelivery] = useState('');
    const [finalizeNotes, setFinalizeNotes] = useState('');

    useEffect(() => { fetchClients(); }, []);

    const fetchClients = () => {
        authFetch('/clients/')
            .then(res => res.json())
            .then(async (data: Client[]) => {
                setClients(data);
                const counts: Record<number, number> = {};
                await Promise.all(data.map(async (c) => {
                    try {
                        const res = await authFetch(`/clients/${c.id}/quotes`);
                        const quotes = await res.json();
                        counts[c.id] = Array.isArray(quotes) ? quotes.filter((q: any) => q.status === 'PENDING').length : 0;
                    } catch { counts[c.id] = 0; }
                }));
                setPendingCount(counts);
            })
            .catch(err => console.error(err));
    };

    const openNew = () => {
        setEditingClient(null);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const openEdit = (c: Client) => {
        setEditingClient(c);
        setFormData({ name: c.name, email: c.email, phone: c.phone, address: c.address });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingClient ? 'PUT' : 'POST';
        const path = editingClient ? `/clients/${editingClient.id}` : '/clients/';
        try {
            const response = await authFetch(path, {
                method,
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchClients();
                setIsModalOpen(false);
                setFormData(emptyForm);
                setEditingClient(null);
            } else {
                const err = await response.json();
                console.error('Error response:', err);
                alert(`Erro ao salvar: ${err.detail || JSON.stringify(err)}`);
            }
        } catch (error) {
            console.error('Error saving client:', error);
            alert(`Erro de conexão: ${error}`);
        }
    };

    const handleDelete = async (client: Client) => {
        // Step 1: check sales summary
        let summary = { total_sales: 0, pending_sales: 0 };
        try {
            const res = await authFetch(`/clients/${client.id}/sales-summary`);
            summary = await res.json();
        } catch {
            alert('Erro ao verificar vendas do cliente.');
            return;
        }

        // Block if there are pending sales
        if (summary.pending_sales > 0) {
            alert(
                `❌ Não é possível excluir "${client.name}".\n\n` +
                `Este cliente possui ${summary.pending_sales} venda(s) com status "Pendente".\n\n` +
                `Conclua ou cancele essas vendas antes de excluir o cliente.`
            );
            return;
        }

        // Warn if there's sales history
        if (summary.total_sales > 0) {
            const confirmed = confirm(
                `⚠️ Atenção: "${client.name}" possui ${summary.total_sales} venda(s) no histórico.\n\n` +
                `Ao excluir o cliente, as vendas NÃO serão apagadas — elas continuarão visíveis na página de Vendas, mas sem o nome do cliente vinculado.\n\n` +
                `Deseja continuar com a exclusão?`
            );
            if (!confirmed) return;
        } else {
            const confirmed = confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`);
            if (!confirmed) return;
        }

        // Proceed with deletion
        try {
            const response = await authFetch(`/clients/${client.id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchClients();
            } else {
                const err = await response.json();
                alert(`Erro: ${err.detail}`);
            }
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    const handleViewHistory = async (id: number) => {
        setLoadingHistory(true);
        setHistoryClient(null);
        setClientQuotes([]);
        setHistoryTab('pedidos');
        try {
            const [histRes, quotesRes] = await Promise.all([
                authFetch(`/dashboard/client-history/${id}`),
                authFetch(`/clients/${id}/quotes`)
            ]);
            const histData = await histRes.json();
            const quotesData = await quotesRes.json();
            setHistoryClient(histData);
            setClientQuotes(Array.isArray(quotesData) ? quotesData : []);
        } catch {
            alert('Erro ao carregar histórico');
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleQuoteAction = async (quoteId: number, action: 'convert' | 'cancel') => {
        if (action === 'cancel') {
            if (!confirm('Confirma cancelar este pedido?')) return;
            try {
                const res = await authFetch(`/quotes/${quoteId}/status?status=CANCELED`, { method: 'PUT' });
                if (!res.ok) { alert('Erro ao cancelar'); return; }
                alert('Pedido cancelado.');
                if (historyClient) handleViewHistory(historyClient.client.id);
                fetchClients();
            } catch { alert('Erro de conexão'); }
            return;
        }
        // Open finalization modal
        setFinalizeQuoteId(quoteId);
        setFinalizePayment('Dinheiro');
        setFinalizeDiscount(0);
        setFinalizeDelivery('');
        setFinalizeNotes('');
    };

    const handleFinalizeConfirm = async () => {
        if (!finalizeQuoteId) return;
        try {
            const res = await authFetch(`/quotes/${finalizeQuoteId}/convert`, {
                method: 'POST',
                body: JSON.stringify({
                    payment_method: finalizePayment,
                    discount_percent: finalizeDiscount,
                    delivery_date: finalizeDelivery || null,
                    notes: finalizeNotes || null
                })
            });
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 409 && data.detail?.items) {
                    const lines = data.detail.items
                        .map((i: { product_name: string; requested: number; available: number }) =>
                            `• ${i.product_name}: solicitado ${i.requested}, disponível ${i.available}`)
                        .join('\n');
                    alert(`Estoque insuficiente:\n${lines}`);
                } else {
                    alert('Erro: ' + (data.detail?.message || data.detail || 'Falha'));
                }
                return;
            }
            alert(`Pedido finalizado! Venda #${data.sale_id} criada.`);
            setFinalizeQuoteId(null);
            if (historyClient) handleViewHistory(historyClient.client.id);
            fetchClients();
        } catch { alert('Erro de conexão'); }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <Link to="/admin/dashboard" className="text-blue-600 hover:underline">← Voltar</Link>
                    <h1 className="text-2xl font-bold bg-white p-4 rounded shadow">Gerenciar Clientes</h1>
                </div>
                <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    + Novo Cliente
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Pesquisar clientes (nome, email, telefone)..."
                    className="w-full p-2 border rounded shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        {c.name}
                                        {(pendingCount[c.id] || 0) > 0 && (
                                            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {pendingCount[c.id]} pendente{pendingCount[c.id] > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{c.email}</td>
                                <td className="px-6 py-4 text-gray-600">{c.phone}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-3 items-center">
                                        <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm" title="Editar">
                                            <Pencil className="h-4 w-4" /> Editar
                                        </button>
                                        <button onClick={() => handleViewHistory(c.id)} className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm" title="Histórico">
                                            <History className="h-4 w-4" /> Histórico
                                        </button>
                                        <button onClick={() => handleDelete(c)} className="text-red-600 hover:text-red-800" title="Excluir">
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredClients.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhum cliente encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Client History Modal */}
            {(historyClient || loadingHistory) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-purple-600" /> Histórico do Cliente
                            </h2>
                            <button onClick={() => { setHistoryClient(null); setClientQuotes([]); }} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
                        </div>
                        {loadingHistory ? (
                            <p className="text-center py-8 text-gray-500">Carregando...</p>
                        ) : historyClient && (
                            <>
                                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                                    <p className="font-bold text-purple-800 text-lg">{historyClient.client.name}</p>
                                    <p className="text-sm text-gray-600">{historyClient.client.email} · {historyClient.client.phone}</p>
                                    <div className="flex gap-6 mt-2">
                                        <div><p className="text-xs text-gray-500">Total Compras</p><p className="font-bold text-purple-700">{historyClient.total_purchases}</p></div>
                                        <div><p className="text-xs text-gray-500">Total Gasto</p><p className="font-bold text-green-700">{BRL(historyClient.total_spent)}</p></div>
                                        <div><p className="text-xs text-gray-500">Pedidos Pendentes</p><p className="font-bold text-yellow-600">{clientQuotes.filter(q => q.status === 'PENDING').length}</p></div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b mb-4">
                                    <button onClick={() => setHistoryTab('pedidos')} className={`px-4 py-2 text-sm font-medium ${historyTab === 'pedidos' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>
                                        <ClipboardList className="h-4 w-4 inline mr-1" /> Pedidos ({clientQuotes.length})
                                    </button>
                                    <button onClick={() => setHistoryTab('compras')} className={`px-4 py-2 text-sm font-medium ${historyTab === 'compras' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>
                                        <ShoppingBag className="h-4 w-4 inline mr-1" /> Compras ({historyClient.sales.length})
                                    </button>
                                </div>

                                {/* Pedidos (Quotes) Tab */}
                                {historyTab === 'pedidos' && (
                                    clientQuotes.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">Nenhum pedido/orçamento registrado.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {clientQuotes.map(quote => (
                                                <div key={quote.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="font-semibold">Pedido #{quote.id}</span>
                                                            <span className="text-sm text-gray-500 ml-2">{new Date(quote.created_at).toLocaleDateString('pt-BR')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-green-700">{BRL(quote.total_estimated)}</p>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${quote.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                quote.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>{quote.status === 'PENDING' ? 'Pendente' : quote.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}</span>
                                                        </div>
                                                    </div>
                                                    <ul className="mt-2 space-y-1 mb-3">
                                                        {quote.items.map((item: any, i: number) => (
                                                            <li key={i} className="text-sm text-gray-700 flex justify-between">
                                                                <span>{item.quantity}x {item.product_name}</span>
                                                                <span>{BRL(item.unit_price * item.quantity)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {quote.status === 'PENDING' && (
                                                        <div className="flex gap-2 pt-2 border-t">
                                                            <button
                                                                onClick={() => handleQuoteAction(quote.id, 'convert')}
                                                                className="flex-1 bg-green-600 text-white py-1.5 rounded text-sm font-medium hover:bg-green-700"
                                                            >
                                                                ✓ Finalizar Pedido
                                                            </button>
                                                            <button
                                                                onClick={() => handleQuoteAction(quote.id, 'cancel')}
                                                                className="flex-1 bg-red-100 text-red-700 py-1.5 rounded text-sm font-medium hover:bg-red-200"
                                                            >
                                                                ✕ Cancelar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* Compras (Sales) Tab */}
                                {historyTab === 'compras' && (
                                    historyClient.sales.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">Nenhuma compra registrada.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {historyClient.sales.map(sale => (
                                                <div key={sale.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="font-semibold">Venda #{sale.id}</span>
                                                            <span className="text-sm text-gray-500 ml-2">{sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : '—'}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-green-700">{BRL(sale.total_amount)}</p>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${sale.status === 'Concluída' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{sale.status || 'Concluída'}</span>
                                                        </div>
                                                    </div>
                                                    <ul className="mt-2 space-y-1">
                                                        {sale.items.map((item: any, i: number) => (
                                                            <li key={i} className="text-sm text-gray-700 flex justify-between">
                                                                <span>{item.quantity}x {item.product_name}</span>
                                                                <span>{BRL(item.unit_price * item.quantity)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Finalization Payment Modal */}
            {finalizeQuoteId !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-green-800">✓ Finalizar Pedido #{finalizeQuoteId}</h2>
                            <button onClick={() => setFinalizeQuoteId(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                                <select className="w-full border rounded p-2" value={finalizePayment} onChange={e => setFinalizePayment(e.target.value)}>
                                    <option>Dinheiro</option>
                                    <option>Pix</option>
                                    <option>Cartão de Débito</option>
                                    <option>Cartão de Crédito</option>
                                    <option>Fiado</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (%)</label>
                                    <input type="number" min="0" max="100" step="0.5" className="w-full border rounded p-2" value={finalizeDiscount} onChange={e => setFinalizeDiscount(Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega</label>
                                    <input type="date" className="w-full border rounded p-2" value={finalizeDelivery} onChange={e => setFinalizeDelivery(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                                <textarea className="w-full border rounded p-2 h-16 resize-none" placeholder="Opcional..." value={finalizeNotes} onChange={e => setFinalizeNotes(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setFinalizeQuoteId(null)} className="flex-1 border border-gray-300 py-2 rounded text-gray-600 hover:bg-gray-50">Cancelar</button>
                            <button onClick={handleFinalizeConfirm} className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700">Confirmar Venda</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New / Edit Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nome *</label>
                                <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                                    {editingClient ? 'Salvar Alterações' : 'Cadastrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
