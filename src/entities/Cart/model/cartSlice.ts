import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@shared/types';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

const loadCartFromStorage = (): CartItem[] => {
    try {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        return [];
    }
};

const initialState: CartState = {
    items: loadCartFromStorage(),
    isOpen: false,
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartOpen: (state, action: PayloadAction<boolean>) => {
            state.isOpen = action.payload;
        },
        addToCart: (state, action: PayloadAction<CartItem['game']>) => {
            const game = action.payload;
            const existingItem = state.items.find(item => item.game.id === game.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ game, quantity: 1, forMyAccount: true });
            }
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
        updateQuantity: (state, action: PayloadAction<{ gameId: number; quantity: number }>) => {
            const { gameId, quantity } = action.payload;
            const item = state.items.find(item => item.game.id === gameId);
            if (item) {
                item.quantity = quantity;
            }
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
        removeItem: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.game.id !== action.payload);
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
        toggleAccountType: (state, action: PayloadAction<number>) => {
            const item = state.items.find(item => item.game.id === action.payload);
            if (item) {
                item.forMyAccount = !item.forMyAccount;
            }
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.setItem('cartItems', JSON.stringify(state.items));
        },
    },
});

export const {
    setCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    toggleAccountType,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

