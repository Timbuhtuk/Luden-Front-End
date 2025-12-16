import { configureStore } from '@reduxjs/toolkit';
import { rtkApi } from '@shared/api/rtkApi';
import cartReducer from '@entities/Cart/model/cartSlice';
import themeReducer from '@features/Theme/model/themeSlice';
import languageReducer from '@features/Language/model/languageSlice';
import currencyReducer from '@features/Currency/model/currencySlice';

export const store = configureStore({
  reducer: {
    [rtkApi.reducerPath]: rtkApi.reducer,
    cart: cartReducer,
    theme: themeReducer,
    language: languageReducer,
    currency: currencyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }).concat(rtkApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from './hooks';
