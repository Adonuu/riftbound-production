import { router } from "./router";

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(req) {
    try {
      return await router(req);
    } catch (err) {
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}`);