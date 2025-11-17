import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

export default defineConfig(({ command }) => ({
    plugins: [react()],
    base: '/Luden-Front-End/', // 🔹 ВАЖЛИВО для GitHub Pages

    resolve: {
        alias: {
            '@app': path.resolve(__dirname, './src/app'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@widgets': path.resolve(__dirname, './src/widgets'),
            '@features': path.resolve(__dirname, './src/features'),
            '@entities': path.resolve(__dirname, './src/entities'),
            '@shared': path.resolve(__dirname, './src/shared'),
        },
    },

    // 🧩 Dev proxy — тільки локально
    server: command === 'serve'
        ? {
            port: 5173,
            headers: {
                // Allow Google Sign-In to work with postMessage and window.closed
                'Cross-Origin-Opener-Policy': 'unsafe-none',
                'Cross-Origin-Embedder-Policy': 'unsafe-none',
            },
            proxy: {
                '/api': {
                    target: 'https://localhost:7010',
                    changeOrigin: true,
                    secure: false,
                },
                '/uploads': {
                    target: 'https://localhost:7010',
                    changeOrigin: true,
                    secure: false,
                },
            },
        }
        : undefined,
}))
