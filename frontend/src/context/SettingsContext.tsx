import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CompanySettings {
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

const defaults: CompanySettings = {
    name: 'Viveiro de Mudas',
    whatsapp: '5511999999999',
    whatsapp_display: '(11) 99999-9999',
    email: 'contato@viveirodemudas.com.br',
    address: 'Rua das Flores, 123 - Jardim Primavera, São Paulo - SP',
    instagram: '',
    facebook: '',
    opening_hours: 'Seg-Sáb: 8h às 18h',
    logo_url: '',
    cnpj: '',
};

const SettingsContext = createContext<CompanySettings>(defaults);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<CompanySettings>(defaults);

    useEffect(() => {
        fetch('http://localhost:8000/settings/')
            .then(r => r.json())
            .then(data => {
                setSettings({
                    name: data.name || defaults.name,
                    whatsapp: data.whatsapp || defaults.whatsapp,
                    whatsapp_display: data.whatsapp_display || defaults.whatsapp_display,
                    email: data.email || defaults.email,
                    address: data.address || defaults.address,
                    instagram: data.instagram || '',
                    facebook: data.facebook || '',
                    opening_hours: data.opening_hours || defaults.opening_hours,
                    logo_url: data.logo_url || '',
                    cnpj: data.cnpj || '',
                });
            })
            .catch(() => { }); // silently fall back to defaults
    }, []);

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
