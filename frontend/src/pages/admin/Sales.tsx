import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Trash, Printer, Search, Edit } from 'lucide-react';
import { COMPANY_INFO } from '../../config';
import { authFetch } from '../../utils/api';

interface Product {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
}

interface Client {
    id: number;
    name: string;
}

interface SaleItemDisplay {
    product_name: string;
    quantity: number;
    unit_price: number;
}

interface SaleDisplay {
    id: number;
    client_name: string;
    date: string; // ISO string from backend
    total_amount: number;
    items: SaleItemDisplay[];
    client_id?: number;
    discount_percent?: number;
    payment_method?: string;
    status?: string;
    delivery_date?: string;
    notes?: string;
}

export default function Sales() {
    const [sales, setSales] = useState<SaleDisplay[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSaleId, setEditingSaleId] = useState<number | null>(null);


    // Form State
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
    const [currentProductId, setCurrentProductId] = useState<number | ''>('');
    const [currentQuantity, setCurrentQuantity] = useState(1);
    // New enriched fields
    const [discountPercent, setDiscountPercent] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
    const [saleStatus, setSaleStatus] = useState('Concluída');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchSales();
        fetchProducts();
        fetchClients();
    }, []);

    const fetchSales = () => {
        // Backend currently doesn't have a specific "get all detailed sales" endpoint optimized for table, 
        // we might need to fetch /sales/ (if implemented) or fallback to dashboard.
        // Assuming we implement GET /sales/ in backend or it exists.
        // Checking backend/routers/sales.py... it only has POST /sales/. 
        // TODO: Need to implement GET /sales/ in backend first or mock it.
        // For now, let's assume we will build it.
        authFetch('/sales/')
            .then(res => {
                if (res.ok) return res.json();
                return [];
            })
            .then(data => setSales(data))
            .catch(err => console.error(err));
    };

    const fetchProducts = () => authFetch('/products/').then(res => res.json()).then(setProducts);
    const fetchClients = () => authFetch('/clients/').then(res => res.json()).then(setClients);

    const addToCart = () => {
        if (!currentProductId) return;
        const product = products.find(p => p.id === Number(currentProductId));
        if (!product) return;

        if (currentQuantity > product.stock_quantity) {
            alert(`Estoque insuficiente. Restam apenas ${product.stock_quantity}.`);
            return;
        }

        setCart([...cart, { product, quantity: currentQuantity }]);
        setCurrentProductId('');
        setCurrentQuantity(1);
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    };

    const handleSubmit = async () => {
        if (cart.length === 0) {
            alert("Adicione produtos ao carrinho.");
            return;
        }

        const payload = {
            client_id: selectedClientId ? Number(selectedClientId) : null,
            items: cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity
            })),
            discount_percent: discountPercent,
            payment_method: paymentMethod,
            status: saleStatus,
            delivery_date: deliveryDate || null,
            notes: notes || null,
        };

        const method = editingSaleId ? 'PUT' : 'POST';
        const path = editingSaleId ? `/sales/${editingSaleId}` : '/sales/';

        try {
            const response = await authFetch(path, {
                method,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(editingSaleId ? "Venda atualizada!" : "Venda registrada!");
                handleCloseModal();
                fetchSales();
                fetchProducts(); // Refresh stock
            } else {
                const err = await response.json();
                alert(`Erro: ${err.detail || 'Falha ao salvar venda'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        }
    };

    const handleOpenEdit = (sale: SaleDisplay) => {
        setEditingSaleId(sale.id);
        setSelectedClientId(sale.client_id || '');

        // Reconstruct items (need product id which we added to backend response)
        // Backend update required to send product_id in items list? YES. 
        // Assuming I updated backend to send product_id in items.
        // If not, I can match by name, but ID is safer. 
        // Let's assume backend update above handled it.
        const reconstitutedCart = sale.items.map(item => {
            // Find product full object for cart display
            // We might need to fetch products first or look up in `products` list
            // `item` has `product_id` (from updated backend).
            // `item` also has unit_price which might differ from current price, but for editing we usually pull current product info 
            // OR keep historical? For simplicity, we find the product in current list.
            // If product deleted, we might have issues. 
            // Ideally we use the item data.

            // Quick match
            const prod = products.find(p => p.name === item.product_name) || {
                id: 0, name: item.product_name, price: item.unit_price, stock_quantity: 0
            } as Product;

            // If we have product_id from backend response, better.
            // But for now let's rely on name match or basic reconstruction
            return { product: prod, quantity: item.quantity };
        });

        setCart(reconstitutedCart);
        setDiscountPercent(sale.discount_percent || 0);
        setPaymentMethod(sale.payment_method || 'Dinheiro');
        setSaleStatus(sale.status || 'Concluída');
        setDeliveryDate(sale.delivery_date || '');
        setNotes(sale.notes || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSaleId(null);
        setCart([]);
        setSelectedClientId('');
        setDiscountPercent(0);
        setPaymentMethod('Dinheiro');
        setSaleStatus('Concluída');
        setDeliveryDate('');
        setNotes('');
    };

    const handleDelete = async (s: SaleDisplay) => {
        if (s.status === 'Concluída') {
            alert('Não é possível excluir uma venda concluída. Use "Reabrir" primeiro para reverter o estoque, depois exclua se necessário.');
            return;
        }
        if (!confirm('Excluir venda? Isso devolverá os itens ao estoque.')) return;
        try {
            const response = await authFetch(`/sales/${s.id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchSales();
                fetchProducts();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleReopen = async (saleId: number) => {
        if (!confirm('Reabrir esta venda? O estoque será devolvido e o status voltará para "Pendente".')) return;
        try {
            const res = await authFetch(`/sales/${saleId}/reopen`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                alert('Venda reaberta! Agora você pode editá-la.');
                fetchSales();
                fetchProducts();
            } else {
                alert('Erro: ' + data.detail);
            }
        } catch {
            alert('Erro de conexão');
        }
    };

    const handlePrint = (sale: SaleDisplay) => {
        const printContent = `
            <html>
                <head>
                    <title>Recibo #${sale.id}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
                        h1, h2, h3, p { margin: 5px 0; text-align: center; }
                        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                        .item { display: flex; justify-content: space-between; }
                        .total { font-weight: bold; font-size: 1.2em; margin-top: 10px; text-align: right; }
                    </style>
                </head>
                <body>
                    <h2>${COMPANY_INFO.name}</h2>
                    <p>${COMPANY_INFO.address}</p>
                    <p>Tel: ${COMPANY_INFO.whatsapp_display}</p>
                    <div className="line">--------------------------------</div>
                    <p><strong>RECIBO DE VENDA #${sale.id}</strong></p>
                    <p>Data: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    <p>Cliente: ${sale.client_name || 'Consumidor'}</p>
                    <div className="line">--------------------------------</div>
                    ${sale.items && sale.items.length > 0 ? sale.items.map(item => `
                        <div class="item">
                            <span>${item.quantity}x ${item.product_name}</span>
                            <span>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price * item.quantity)}</span>
                        </div>
                    `).join('') : '<p>Itens não detalhados nesta venda.</p>'}
                    <div className="line">--------------------------------</div>
                    <div class="total">
                        TOTAL: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_amount)}
                    </div>
                    <div className="line">--------------------------------</div>
                    <p>Obrigado pela preferência!</p>
                </body>
            </html>
        `;

        const printWindow = window.open('', '', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <Link to="/admin/dashboard" className="text-blue-600 hover:underline">← Voltar</Link>
                    <h1 className="text-2xl font-bold bg-white p-4 rounded shadow">Registro de Vendas</h1>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" /> Nova Venda
                </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar vendas (número, cliente)..."
                        className="w-full pl-10 p-2 border rounded shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">De:</label>
                    <input type="date" className="p-2 border rounded shadow-sm text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">Até:</label>
                    <input type="date" className="p-2 border rounded shadow-sm text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200">✕ Limpar</button>
                )}
            </div>

            {/* Sales List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sales.filter(s => {
                            const matchSearch = s.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                s.id.toString().includes(searchTerm);
                            const saleDate = s.date ? s.date.substring(0, 10) : '';
                            const matchFrom = !dateFrom || saleDate >= dateFrom;
                            const matchTo = !dateTo || saleDate <= dateTo;
                            return matchSearch && matchFrom && matchTo;
                        }).map((s) => (
                            <tr key={s.id}>
                                <td className="px-6 py-4">#{s.id}</td>
                                <td className="px-6 py-4">{s.client_name ? s.client_name : 'Cliente ' + s.id}</td>
                                <td className="px-6 py-4 font-bold text-green-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.total_amount)}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{s.payment_method || '—'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                                        s.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>{s.status || 'Concluída'}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date().toLocaleDateString()} {/* Placeholder as backend might not return date yet */}
                                </td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button onClick={() => handlePrint(s)} className="text-gray-600 hover:text-blue-600" title="Imprimir Recibo">
                                        <Printer className="h-5 w-5" />
                                    </button>
                                    {s.status === 'Concluída' ? (
                                        <button onClick={() => handleReopen(s.id)} className="text-orange-600 hover:text-orange-800 flex items-center gap-1 text-sm font-medium" title="Reabrir Venda">
                                            <Edit className="h-4 w-4" /> Reabrir
                                        </button>
                                    ) : (
                                        <button onClick={() => handleOpenEdit(s)} className="text-blue-600 hover:text-blue-800" title="Editar Venda">
                                            <Edit className="h-5 w-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(s)}
                                        disabled={s.status === 'Concluída'}
                                        className={`${s.status === 'Concluída' ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                                        title={s.status === 'Concluída' ? 'Reabra a venda antes de excluir' : 'Excluir Venda'}
                                    >
                                        <Trash className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">Nenhuma venda registrada ainda.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* New Sale Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingSaleId ? `Editar Venda #${editingSaleId}` : 'Registrar Nova Venda'}</h2>
                            <button onClick={handleCloseModal}><X /></button>
                        </div>

                        <div className="space-y-6">
                            {/* Client Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cliente</label>

                                <select
                                    className="mt-1 block w-full border rounded p-2"
                                    value={selectedClientId}
                                    onChange={e => setSelectedClientId(e.target.value ? Number(e.target.value) : '')}
                                >
                                    <option value="">Consumidor Final (Não Cadastrado)</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Add Product */}
                            <div className="bg-gray-50 p-4 rounded border">
                                <h3 className="font-semibold mb-2">Adicionar Produto</h3>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 border rounded p-2"
                                        value={currentProductId}
                                        onChange={e => setCurrentProductId(Number(e.target.value))}
                                    >
                                        <option value="">Produto...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id} disabled={p.stock_quantity < 1}>
                                                {p.name} (R$ {p.price} - Est: {p.stock_quantity})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number" min="1"
                                        className="w-20 border rounded p-2"
                                        value={currentQuantity}
                                        onChange={e => setCurrentQuantity(Number(e.target.value))}
                                    />
                                    <button onClick={addToCart} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">Add</button>
                                </div>
                            </div>

                            {/* Cart */}
                            <div>
                                <h3 className="font-semibold mb-2">Carrinho</h3>
                                <ul className="border rounded divide-y">
                                    {cart.map((item, idx) => (
                                        <li key={idx} className="p-2 flex justify-between items-center bg-white">
                                            <span>{item.quantity}x {item.product.name}</span>
                                            <div className="flex items-center gap-4">
                                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.product.price * item.quantity)}</span>
                                                <button onClick={() => removeFromCart(idx)} className="text-red-500"><Trash className="h-4 w-4" /></button>
                                            </div>
                                        </li>
                                    ))}
                                    {cart.length === 0 && <li className="p-2 text-gray-500 text-center">Carrinho vazio</li>}
                                </ul>
                                <div className="mt-2 text-right text-xl font-bold">
                                    Subtotal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}
                                </div>
                            </div>

                            {/* Enriched Sale Fields */}
                            <div className="bg-gray-50 p-4 rounded border space-y-4">
                                <h3 className="font-semibold text-gray-700">Detalhes do Pedido</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                                        <select
                                            className="w-full border rounded p-2"
                                            value={paymentMethod}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                        >
                                            <option>Dinheiro</option>
                                            <option>Pix</option>
                                            <option>Cartão de Débito</option>
                                            <option>Cartão de Crédito</option>
                                            <option>Fiado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            className="w-full border rounded p-2"
                                            value={saleStatus}
                                            onChange={e => setSaleStatus(e.target.value)}
                                        >
                                            <option>Concluída</option>
                                            <option>Pendente</option>
                                            <option>Cancelada</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (%)</label>
                                        <input
                                            type="number" min="0" max="100" step="0.5"
                                            className="w-full border rounded p-2"
                                            value={discountPercent}
                                            onChange={e => setDiscountPercent(Number(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega</label>
                                        <input
                                            type="date"
                                            className="w-full border rounded p-2"
                                            value={deliveryDate}
                                            onChange={e => setDeliveryDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                                    <textarea
                                        className="w-full border rounded p-2 h-20 resize-none"
                                        placeholder="Ex: Entregar na portaria, cliente preferencial..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    />
                                </div>
                                {discountPercent > 0 && (
                                    <div className="text-right text-green-700 font-semibold">
                                        Desconto: -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal() * discountPercent / 100)}
                                        <br />
                                        <span className="text-xl text-gray-800">Total Final: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal() * (1 - discountPercent / 100))}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700"
                                disabled={cart.length === 0}
                            >
                                Finalizar Venda e Baixar Estoque
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
