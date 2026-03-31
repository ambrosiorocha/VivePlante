import { Facebook, Instagram, Phone, MapPin, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
    const s = useSettings();
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">{s.name}</h3>
                    <p className="mb-4">Cultivando vida e natureza para o seu lar. Especialistas em mudas frutíferas, ornamentais e projetos de paisagismo.</p>
                    <div className="flex space-x-4">
                        {s.instagram ? (
                            <a href={`https://instagram.com/${s.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-green-400"><Instagram /></a>
                        ) : (
                            <a href="#" className="hover:text-green-400"><Instagram /></a>
                        )}
                        {s.facebook ? (
                            <a href={s.facebook.startsWith('http') ? s.facebook : `https://${s.facebook}`} target="_blank" rel="noreferrer" className="hover:text-green-400"><Facebook /></a>
                        ) : (
                            <a href="#" className="hover:text-green-400"><Facebook /></a>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Contato</h3>
                    <ul className="space-y-2">
                        <li className="flex items-center"><Phone className="h-4 w-4 mr-2" /> {s.whatsapp_display}</li>
                        <li className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> {s.address}</li>
                        <li className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {s.opening_hours}</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Links Rápidos</h3>
                    <ul className="space-y-2">
                        <li><a href="/catalogo" className="hover:text-green-400">Catálogo</a></li>
                        <li><a href="/servicos" className="hover:text-green-400">Serviços</a></li>
                        <li><a href="/admin" className="hover:text-green-400">Área Restrita</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                &copy; {new Date().getFullYear()} {s.name}. Todos os direitos reservados.
            </div>
        </footer>
    );
}
