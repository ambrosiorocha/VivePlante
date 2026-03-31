import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, Package, AlertTriangle, Settings } from 'lucide-react';
import { authFetch, clearAdminSession } from '../../utils/api';

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];
const BRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Stats {
    total_products: number;
    total_sales: number;
    total_revenue: number;
    total_clients: number;
    low_stock_count: number;
}

interface MonthlyRevenue { month: string; label: string; revenue: number; }
interface TopProduct { name: string; quantity: number; revenue: number; }
interface LowStockItem { id: number; name: string; stock: number; category: string; }

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats | null>(null);
    const [monthly, setMonthly] = useState<MonthlyRevenue[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            authFetch('/dashboard/stats').then(r => r.json()),
            authFetch('/dashboard/monthly-revenue').then(r => r.json()),
            authFetch('/dashboard/top-products').then(r => r.json()),
            authFetch('/dashboard/low-stock').then(r => r.json()),
        ]).then(([s, m, t, l]) => {
            setStats(s);
            setMonthly(m);
            setTopProducts(t);
            setLowStock(l);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) => (
        <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                </div>
                <div className="text-gray-400">{icon}</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">🌿 Painel Administrativo</h1>
                <div className="flex gap-3">
                    <Link to="/" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm">Ver Site</Link>
                    <Link to="/admin/settings" className="flex items-center gap-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm">
                        <Settings className="h-4 w-4" /> Configurações
                    </Link>
                    <button onClick={() => { clearAdminSession(); navigate('/admin'); }} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm">Sair</button>
                </div>
            </div>

            {/* Quick Access Nav Bar */}
            <div className="bg-white border-b shadow-sm px-8 py-3">
                <div className="flex gap-3 flex-wrap">
                    <Link to="/admin/products" className="flex items-center gap-2 px-5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-lg transition text-sm">
                        <Package className="h-5 w-5" /> Produtos
                    </Link>
                    <Link to="/admin/sales" className="flex items-center gap-2 px-5 py-2 bg-green-50 hover:bg-green-100 text-green-800 font-semibold rounded-lg transition text-sm">
                        <ShoppingBag className="h-5 w-5" /> Vendas
                    </Link>
                    <Link to="/admin/clients" className="flex items-center gap-2 px-5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold rounded-lg transition text-sm">
                        <Users className="h-5 w-5" /> Clientes
                    </Link>

                </div>
            </div>

            <div className="p-8 space-y-8">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Carregando dados...</div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Receita Total" value={BRL(stats?.total_revenue || 0)} icon={<TrendingUp className="h-8 w-8" />} color="border-green-500" />
                            <StatCard label="Vendas Realizadas" value={stats?.total_sales || 0} icon={<ShoppingBag className="h-8 w-8" />} color="border-blue-500" />
                            <StatCard label="Clientes Cadastrados" value={stats?.total_clients || 0} icon={<Users className="h-8 w-8" />} color="border-purple-500" />
                            <StatCard label="Produtos Cadastrados" value={stats?.total_products || 0} icon={<Package className="h-8 w-8" />} color="border-orange-500" />
                        </div>

                        {/* Low Stock Alert */}
                        {lowStock.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <h2 className="font-bold text-red-700">⚠️ Estoque Crítico ({lowStock.length} produto{lowStock.length > 1 ? 's' : ''})</h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {lowStock.map(p => (
                                        <span key={p.id} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                            {p.name} — <strong>{p.stock} un.</strong>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Monthly Revenue Bar Chart */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-700 mb-4">📈 Receita Mensal</h2>
                                {monthly.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={monthly} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
                                            <Tooltip formatter={(v) => BRL(Number(v ?? 0))} />
                                            <Bar dataKey="revenue" name="Receita" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-gray-400">Nenhuma venda registrada ainda.</div>
                                )}
                            </div>

                            {/* Top Products Pie Chart */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-700 mb-4">🏆 Mais Vendidos</h2>
                                {topProducts.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={topProducts} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: { name?: string; percent?: number }) => `${(name || '').split(' ')[0]} ${((percent || 0) * 100).toFixed(0)}%`}>
                                                {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v) => [`${v ?? 0} un.`, 'Qtd']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-gray-400">Nenhuma venda registrada ainda.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
