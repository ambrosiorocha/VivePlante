import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    clientId: number | null;
    clientName: string | null;
    clientPhone: string | null;
    clientCity: string | null;
    register: (id: number, name: string, phone: string, city: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [clientId, setClientId] = useState<number | null>(null);
    const [clientName, setClientName] = useState<string | null>(null);
    const [clientPhone, setClientPhone] = useState<string | null>(null);
    const [clientCity, setClientCity] = useState<string | null>(null);

    useEffect(() => {
        const storedId = localStorage.getItem('vive_client_id');
        const storedName = localStorage.getItem('vive_client_name');
        const storedPhone = localStorage.getItem('vive_client_phone');
        const storedCity = localStorage.getItem('vive_client_city');
        if (storedId) setClientId(Number(storedId));
        if (storedName) setClientName(storedName);
        if (storedPhone) setClientPhone(storedPhone);
        if (storedCity) setClientCity(storedCity);
    }, []);

    const register = (id: number, name: string, phone: string, city: string) => {
        setClientId(id);
        setClientName(name);
        setClientPhone(phone);
        setClientCity(city);
        localStorage.setItem('vive_client_id', String(id));
        localStorage.setItem('vive_client_name', name);
        localStorage.setItem('vive_client_phone', phone);
        localStorage.setItem('vive_client_city', city);
    };

    const logout = () => {
        setClientId(null);
        setClientName(null);
        setClientPhone(null);
        setClientCity(null);
        localStorage.removeItem('vive_client_id');
        localStorage.removeItem('vive_client_name');
        localStorage.removeItem('vive_client_phone');
        localStorage.removeItem('vive_client_city');
    };

    return (
        <AuthContext.Provider value={{
            clientId,
            clientName,
            clientPhone,
            clientCity,
            register,
            logout,
            isAuthenticated: !!clientId
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
