// Client-side models (for UI components)

export interface Game {
    id: number;
    title: string;
    image: string;
    price?: string;
    priceValue?: number; // Оригинальная цена как число для расчетов
    genre?: string;
    isFavorite?: boolean;
    discountPercent: number | null;
}

export interface CartItem {
    game: Game;
    quantity: number;
    forMyAccount: boolean; // Для моего аккаунта или в подарок
}

export interface Bonus {
    id: number;
    name: string;
    description: string;
}

export interface Friend {
    id: number;
    name: string;
    avatar: string;
}

