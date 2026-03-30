import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'main/index.html'),
                contact: resolve(__dirname, 'main/contact.html'),
                work: resolve(__dirname, 'main/work.html'),
                brand: resolve(__dirname, 'brand/index.html'),
            },
        },
    },
});
