import { Phone, Mail, MapPin } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Contact() {
    const s = useSettings();
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-green-900 mb-12 text-center">Entre em Contato</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6">Envie uma mensagem</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Nome</label>
                            <input type="text" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Seu nome" />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Email</label>
                            <input type="email" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" placeholder="seu@email.com" />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Mensagem</label>
                            <textarea className="w-full border rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Como podemos ajudar?" />
                        </div>
                        <button className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition">
                            Enviar Mensagem
                        </button>
                    </form>
                </div>

                <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-4 rounded-full text-green-600">
                            <Phone className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Telefone / WhatsApp</h3>
                            <p className="text-gray-600">{s.whatsapp_display}</p>
                            <p className="text-gray-500 text-sm">Disponível em horário comercial</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-4 rounded-full text-green-600">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Email</h3>
                            <p className="text-gray-600">{s.email}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-4 rounded-full text-green-600">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Localização</h3>
                            <p className="text-gray-600">{s.address}</p>
                            <div className="mt-4 rounded-lg overflow-hidden h-48 bg-gray-200">
                                {/* Map placeholder */}
                                <div className="w-full h-full flex items-center justify-center text-gray-500">Mapa Google Maps</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
