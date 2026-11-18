import { serve } from "bun";
import index from "../web/index.html";

const hostname = process.argv.includes("--intranet")
  ? process.env.REMEMORE_LAN_HOST || "192.168.0.24"
  : process.env.NODE_ENV === "production"
  ? "0.0.0.0"
  : "127.0.0.1";

const server = serve({
  hostname,
  port: 3000,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      GET() {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      PUT() {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
