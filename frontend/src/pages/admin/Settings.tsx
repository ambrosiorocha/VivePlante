import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Save, Building2, Phone, Mail, MapPin, Clock, Globe, FileText } from 'lucide-react';
import { authFetch } from '../../utils/api';

interface Settings {
    name: string;
    whatsapp: string;
    whatsapp_display: string;
    email: string;
    address: string;
    instagram: string;
    facebook: string;
    opening_hours: string;
    logo_url: string;
    cnpj: string;
}

const defaultSettings: Settings = {
    name: '', whatsapp: '', whatsapp_display: '', email: '',
    address: '', instagram: '', facebook: '', opening_hours: '',
    logo_url: '', cnpj: ''
};

// Field component defined OUTSIDE the parent to prevent remounting on every render
function SettingsField({ label, name, icon, placeholder, type = 'text', value, onChange }: {
    label: string;
    name: string;
    icon: React.ReactNode;
    placeholder?: string;
    type?: string;
    value: string;
    onChange: (name: string, value: string) => void;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <div className="absolute left-3 top-2.5 text-gray-400">{icon}</div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={e => onChange(name, e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
            </div>
        </div>
    );
}

export default function Settings() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8000/settings/')
            .then(res => res.json())
            .then(data => {
                setSettings({
                    name: data.name || '',
                    whatsapp: data.whatsapp || '',
                    whatsapp_display: data.whatsapp_display || '',
                    email: data.email || '',
                    address: data.address || '',
                    instagram: data.instagram || '',
                    facebook: data.facebook || '',
                    opening_hours: data.opening_hours || '',
                    logo_url: data.logo_url || '',
                    cnpj: data.cnpj || '',
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleChange = (name: string, value: string) => {
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await authFetch('/settings/', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando configurações...</div>;

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/dashboard" className="text-blue-600 hover:underline text-sm">← Voltar</Link>
                        <h1 className="text-2xl font-bold text-gray-800">⚙️ Configurações da Empresa</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition ${saved ? 'bg-green-500 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar'}
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow p-6 space-y-6">
                    {/* Informações Gerais */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">🏢 Informações Gerais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingsField label="Nome do Viveiro" name="name" icon={<Building2 className="h-4 w-4" />} placeholder="Ex: Viveiro de Mudas" value={settings.name} onChange={handleChange} />
                            <SettingsField label="CNPJ" name="cnpj" icon={<FileText className="h-4 w-4" />} placeholder="00.000.000/0001-00" value={settings.cnpj} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Contato */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">📞 Contato</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingsField label="WhatsApp (com código do país)" name="whatsapp" icon={<Phone className="h-4 w-4" />} placeholder="5511999999999" value={settings.whatsapp} onChange={handleChange} />
                            <SettingsField label="WhatsApp (exibição)" name="whatsapp_display" icon={<Phone className="h-4 w-4" />} placeholder="(11) 99999-9999" value={settings.whatsapp_display} onChange={handleChange} />
                            <SettingsField label="E-mail" name="email" icon={<Mail className="h-4 w-4" />} type="email" placeholder="contato@viveiro.com.br" value={settings.email} onChange={handleChange} />
                            <SettingsField label="Horário de Funcionamento" name="opening_hours" icon={<Clock className="h-4 w-4" />} placeholder="Seg-Sáb: 8h às 18h" value={settings.opening_hours} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Endereço */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">📍 Endereço</h2>
                        <SettingsField label="Endereço Completo" name="address" icon={<MapPin className="h-4 w-4" />} placeholder="Rua das Flores, 123 - Bairro, Cidade - UF" value={settings.address} onChange={handleChange} />
                    </div>

                    {/* Redes Sociais */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">🌐 Redes Sociais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingsField label="Instagram (usuário)" name="instagram" icon={<Globe className="h-4 w-4" />} placeholder="@viveirodemudas" value={settings.instagram} onChange={handleChange} />
                            <SettingsField label="Facebook (URL ou usuário)" name="facebook" icon={<Globe className="h-4 w-4" />} placeholder="facebook.com/viveirodemudas" value={settings.facebook} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Logo */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">🖼️ Logo</h2>
                        <SettingsField label="URL da Logo (link de imagem)" name="logo_url" icon={<Globe className="h-4 w-4" />} placeholder="https://..." value={settings.logo_url} onChange={handleChange} />
                        {settings.logo_url && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-500 mb-2">Pré-visualização:</p>
                                <img src={settings.logo_url} alt="Logo" className="h-20 object-contain border rounded p-2" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
