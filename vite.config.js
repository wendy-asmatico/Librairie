import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const prodEnv = loadEnv("production", process.cwd(), "VITE_");
  return {
    plugins: [react(), tailwindcss()],
    base: "/ecom",
    server: {
      proxy: {
        "/woo-api": {
          target: prodEnv.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/woo-api/, ""),

          configure: (proxy, _options) => {
            proxy.on("proxyRes", (proxyRes, req, res) => {
              const setCookie = proxyRes.headers["set-cookie"];
              if (setCookie) {
                proxyRes.headers["set-cookie"] = setCookie.map((cookie) =>
                  cookie
                    .replace(/Secure/gi, "")
                    .replace(/SameSite=None/gi, "SameSite=Lax")
                    .replace(/domain=[^;]+/gi, "")
                    .replace(/path=\/wooc[\w-]*\/?/gi, "path=/")
                    .replace(/;\s*;/g, ";"),
                );
              }
            });
          },
        },
      },
    },
  };
});
