import { serve } from "bun";
import index from "../web/index.html";
import { criarConta, redefinirSenha } from "@api/controllers/usuarios";
import { consultarSessao, entrar, sair } from "@api/controllers/sessao";
import { consultarHome } from "@api/controllers/home";
import { consultarOrientacaoProgressiva } from "@api/controllers/orientacao-progressiva";

const hostname = process.argv.includes("--intranet")
  ? process.env.REMEMORE_LAN_HOST || "192.168.0.24"
  : process.env.NODE_ENV === "production"
  ? "0.0.0.0"
  : "127.0.0.1";

const server = serve({
  hostname,
  port: 3000,
  routes: {
    "/api/home": { GET: consultarHome },
    "/api/orientacao-progressiva": { GET: consultarOrientacaoProgressiva },
    "/api/usuarios": { POST: criarConta },
    "/api/usuarios/redefinicao-senha": { POST: redefinirSenha },
    "/api/sessao": {
      GET: consultarSessao,
      POST: entrar,
      DELETE: sair,
    },
    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
