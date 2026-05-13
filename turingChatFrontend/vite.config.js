import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    define: {
        global: "window"
    },

    server: {
        host: true,
        port: 56497,
        allowedHosts: ["turingchat.ngrok.app"],

        hmr: {
            protocol: "wss",
            host: "turingchat.ngrok.app",
            clientPort: 443
        }
    }
});