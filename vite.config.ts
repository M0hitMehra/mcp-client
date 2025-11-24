import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Proxy /mcp calls to the backend if running locally and not CORS enabled
            // This is a fallback; the app is designed to talk to a URL provided by the user.
            // However, for local dev against a server on 8443, this might help if we hardcode it.
            // But per requirements, user inputs the URL.
        }
    }
})
