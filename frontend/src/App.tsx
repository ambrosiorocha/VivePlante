import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Contact from './pages/Contact';
import About from './pages/About';
import Register from './pages/Register';
import Cart from './pages/Cart';

// Placeholder Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Sales from './pages/admin/Sales';
import Clients from './pages/admin/Clients';
import Settings from './pages/admin/Settings';
import Quotes from './pages/admin/Quotes';

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-green-50">
                {children}
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <CartProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Layout><Home /></Layout>} />
                            <Route path="/catalogo" element={<Layout><Catalog /></Layout>} />
                            <Route path="/produto/:id" element={<Layout><ProductDetail /></Layout>} />
                            <Route path="/servicos" element={<Layout><Services /></Layout>} />
                            <Route path="/contato" element={<Layout><Contact /></Layout>} />
                            <Route path="/sobre" element={<Layout><About /></Layout>} />
                            <Route path="/cadastro" element={<Layout><Register /></Layout>} />
                            <Route path="/carrinho" element={<Layout><Cart /></Layout>} />

                            {/* Admin Routes - keeping simple for now */}
                            <Route path="/admin" element={<Login />} />
                            <Route path="/admin/dashboard" element={<Dashboard />} />
                            <Route path="/admin/products" element={<Products />} />
                            <Route path="/admin/sales" element={<Sales />} />
                            <Route path="/admin/clients" element={<Clients />} />
                            <Route path="/admin/settings" element={<Settings />} />
                            <Route path="/admin/orcamentos" element={<Quotes />} />
                        </Routes>
                    </BrowserRouter>
                </CartProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;
