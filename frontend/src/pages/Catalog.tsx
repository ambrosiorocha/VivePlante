import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    category: string;
    price?: number;
    image_url?: string;
}

export default function Catalog() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, clientId } = useAuth();
    const { addItem } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:8000/products/public');
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="p-8 text-center">Carregando catálogo...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-green-900">Catálogo de Produtos</h1>
                <Link to="/carrinho" className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded hover:bg-green-200">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-bold">Ver Carrinho</span>
                </Link>
            </div>

            {products.length === 0 ? (
                <p>Nenhum produto cadastrado ainda.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
                            <div className="h-48 bg-gray-200 relative">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">Sem imagem</div>
                                )}
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                                <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{product.category}</p>

                                <div className="mt-auto pt-4">
                                    {isAuthenticated && product.price !== undefined ? (
                                        <>
                                            <p className="text-xl font-bold text-green-700 mb-3">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                            </p>
                                            <button onClick={() => addItem(product)} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2">
                                                <ShoppingCart className="w-4 h-4" /> Adicionar
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-gray-500 text-sm mb-2">Preço indisponível</p>
                                            <Link to="/cadastro" className="block w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm font-bold">
                                                Cadastre-se para ver preço
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
