import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const prodEnv = loadEnv("production", process.cwd(), "VITE_");
  const apiUrl = new URL(prodEnv.VITE_API_URL);
  const apiBasePath = apiUrl.pathname.replace(/\/$/, "");
  return {
    plugins: [react(), tailwindcss()],
    base: "/ecom",
    server: {
      proxy: {
        "/woo-api": {
          target: apiUrl.origin,
          changeOrigin: true,
          secure: false,
          rewrite: (path) =>
            `${apiBasePath}${path.replace(/^\/woo-api/, "")}`,

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
