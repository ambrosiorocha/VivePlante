import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash, X } from 'lucide-react';
import { authFetch } from '../../utils/api';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock_quantity: number;
    description: string;
    image_url: string;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: 0,
        stock_quantity: 0,
        description: '',
        image_url: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        authFetch('/products/')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err));
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price,
                stock_quantity: product.stock_quantity,
                description: product.description || '',
                image_url: product.image_url || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: '',
                price: 0,
                stock_quantity: 0,
                description: '',
                image_url: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const response = await authFetch(
                editingProduct ? `/products/${editingProduct.id}` : '/products/',
                { method, body: JSON.stringify(formData) },
            );
            if (response.ok) {
                fetchProducts();
                handleCloseModal();
            } else {
                alert('Erro ao salvar produto');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Erro ao salvar produto');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;

        try {
            const response = await authFetch(`/products/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchProducts();
            } else {
                alert('Erro ao excluir produto');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <Link to="/admin/dashboard" className="text-blue-600 hover:underline">← Voltar</Link>
                    <h1 className="text-2xl font-bold bg-white p-4 rounded shadow">Gerenciar Produtos</h1>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    + Novo Produto
                </button>

            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Pesquisar produtos..."
                    className="w-full p-2 border rounded shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.filter(p =>
                            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((p) => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{p.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {p.image_url && <img src={p.image_url} alt="" className="h-8 w-8 rounded-full mr-2 object-cover" />}
                                        {p.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{p.stock_quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap flex space-x-4">
                                    <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-900">
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">
                                        <Trash className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Estoque</label>
                                        <input
                                            type="number"
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                            value={formData.stock_quantity}
                                            onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                                    <textarea
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
