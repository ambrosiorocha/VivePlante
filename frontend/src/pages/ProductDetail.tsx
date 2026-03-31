import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    description?: string;
    image_url?: string;
}

export default function ProductDetail() {
    const { id } = useParams();
    const s = useSettings();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:8000/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch product", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-8 text-center">Carregando...</div>;
    if (!product) return <div className="p-8 text-center">Produto não encontrado.</div>;

    const handleBuyClick = () => {
        const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);
        const message = `Olá! Gostaria de comprar o produto: *${product.name}* (${priceFormatted}).`;
        const url = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/catalogo" className="flex items-center text-green-600 mb-6 hover:text-green-800">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Catálogo
            </Link>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2 h-96 bg-gray-200">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">Sem imagem</div>
                    )}
                </div>

                <div className="md:w-1/2 p-8">
                    <span className="text-sm text-green-600 font-semibold tracking-wide uppercase">{product.category}</span>
                    <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {product.description || "Sem descrição disponível."}
                    </p>

                    <div className="flex items-center justify-between mb-8">
                        <span className="text-3xl font-bold text-green-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                        </span>
                    </div>

                    <button
                        onClick={handleBuyClick}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg shadow-md transition flex items-center justify-center text-lg"
                    >
                        <MessageCircle className="mr-2 h-6 w-6" /> Comprar no WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}
