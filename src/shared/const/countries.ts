export type Country = {
    nameKey: string;
    currency: string;
    symbol: string;
    rate: number;
};

export const COUNTRIES: Country[] = [
    { nameKey: 'ukraine', currency: 'UAH', symbol: '₴', rate: 1 },
    { nameKey: 'usa', currency: 'USD', symbol: '$', rate: 0.024 },
    { nameKey: 'poland', currency: 'PLN', symbol: 'zł', rate: 0.095 },
    { nameKey: 'spain', currency: 'EUR', symbol: '€', rate: 0.022 },
    { nameKey: 'bulgaria', currency: 'BGN', symbol: 'лв', rate: 0.043 },
    { nameKey: 'germany', currency: 'EUR', symbol: '€', rate: 0.022 },
    { nameKey: 'france', currency: 'EUR', symbol: '€', rate: 0.022 },
    { nameKey: 'italy', currency: 'EUR', symbol: '€', rate: 0.022 },
    { nameKey: 'czechRepublic', currency: 'CZK', symbol: 'Kč', rate: 0.55 },
    { nameKey: 'romania', currency: 'RON', symbol: 'lei', rate: 0.11 },
];

