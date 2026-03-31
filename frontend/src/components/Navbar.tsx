import { Link } from 'react-router-dom';
import { Leaf, User, ShoppingCart } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const s = useSettings();
    const { itemCount } = useCart();
    return (
        <nav className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
                    <Leaf className="h-8 w-8 text-green-300" />
                    <span>{s.name}</span>
                </Link>

                <div className="hidden md:flex space-x-8 text-lg">
                    <Link to="/" className="hover:text-green-300 transition">Início</Link>
                    <Link to="/catalogo" className="hover:text-green-300 transition">Catálogo</Link>
                    <Link to="/servicos" className="hover:text-green-300 transition">Serviços</Link>
                    <Link to="/sobre" className="hover:text-green-300 transition">Sobre</Link>
                    <Link to="/contato" className="hover:text-green-300 transition">Contato</Link>
                </div>

                <div className="flex items-center space-x-4">
                    <Link to="/carrinho" className="relative p-2 hover:bg-green-700 rounded-full transition" title="Carrinho">
                        <ShoppingCart className="h-6 w-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/admin" className="p-2 hover:bg-green-700 rounded-full transition" title="Admin">
                        <User className="h-6 w-6" />
                    </Link>
                    <a href={`https://wa.me/${s.whatsapp}`} target="_blank" className="hidden sm:block bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full font-semibold transition">
                        WhatsApp
                    </a>
                </div>
            </div>
        </nav>
    );
}
