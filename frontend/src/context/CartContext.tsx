import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: any, quantity?: number) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('vive_cart');
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('vive_cart', JSON.stringify(items));
    }, [items]);

    const addItem = (product: any, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i => i.id === product.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                );
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price || 0, // Handle possible missing price if added from public view (shouldn't happen in flow but safe)
                quantity,
                image_url: product.image_url
            }];
        });
    };

    const removeItem = (productId: number) => {
        setItems(prev => prev.filter(i => i.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
