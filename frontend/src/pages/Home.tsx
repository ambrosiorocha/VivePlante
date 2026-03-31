import { ArrowRight, Sprout, Trees, Flower2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center bg-green-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />

                {/* Main Content - Pushed up slightly to mimic original position */}
                <div className="relative z-20 text-center px-4 w-full mx-auto flex flex-col items-center pb-20">
                    <div className="max-w-4xl">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
                            Traga a Natureza para Perto
                        </h1>
                    </div>
                    <p className="text-xl md:text-2xl mb-8 text-green-100 font-medium whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        A maior variedade de mudas frutíferas, ornamentais e projetos de paisagismo da região.
                    </p>
                </div>

                {/* Buttons - Absolute Bottom */}
                <div className="absolute bottom-12 z-20 w-full flex flex-col sm:flex-row justify-center gap-4 px-4">
                    <Link to="/catalogo" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1">
                        Ver Catálogo <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link to="/contato" className="bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white border border-white/30 px-8 py-3 rounded-full text-lg font-semibold transition shadow-lg hover:shadow-xl hover:-translate-y-1">
                        Fale Conosco
                    </Link>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-green-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-green-900 mb-12">Nossas Categorias</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                                <Trees className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Mudas Frutíferas</h3>
                            <p className="text-gray-600 mb-6">Variedade de cítricos, nativas e exóticas prontas para plantio.</p>
                            <Link to="/catalogo?cat=frutiferas" className="text-green-600 font-semibold hover:text-green-700">Ver opções &rarr;</Link>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                                <Flower2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Ornamentais</h3>
                            <p className="text-gray-600 mb-6">Plantas para jardim, interior e decoração de ambientes.</p>
                            <Link to="/catalogo?cat=ornamentais" className="text-green-600 font-semibold hover:text-green-700">Ver opções &rarr;</Link>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                                <Sprout className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Serviços</h3>
                            <p className="text-gray-600 mb-6">Paisagismo, manutenção de jardins e projetos personalizados.</p>
                            <Link to="/servicos" className="text-green-600 font-semibold hover:text-green-700">Saiba mais &rarr;</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
