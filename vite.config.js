import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                contact: resolve(__dirname, 'contact.html'),
                work: resolve(__dirname, 'work.html'),
                brand: resolve(__dirname, 'brand.html'),
                hello: resolve(__dirname, 'hello/index.html'),
            },
        },
    },
});
