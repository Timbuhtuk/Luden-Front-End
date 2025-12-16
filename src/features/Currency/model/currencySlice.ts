import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { COUNTRIES, type Country } from '@shared/const/countries';

interface CurrencyState {
    selectedCountry: Country;
}

const getInitialCountry = (): Country => {
    try {
        const saved = localStorage.getItem('selectedCountry');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load currency from storage', e);
    }
    return COUNTRIES[0]; // Default to Ukraine
};

const initialState: CurrencyState = {
    selectedCountry: getInitialCountry(),
};

export const currencySlice = createSlice({
    name: 'currency',
    initialState,
    reducers: {
        setCurrency: (state, action: PayloadAction<Country>) => {
            state.selectedCountry = action.payload;
            localStorage.setItem('selectedCountry', JSON.stringify(action.payload));
        },
    },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;

