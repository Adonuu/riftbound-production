import { router } from "./router";
import { existsSync, createReadStream } from "fs";
import { join } from "path";

const UPLOAD_DIR = join(import.meta.dir, "uploads");

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api/uploads/")) {
      const filename = url.pathname.split("/api/uploads/")[1] ?? "";
      const filepath = join(UPLOAD_DIR, filename);

      if (!existsSync(filepath)) {
        return Response.json({ error: "File not found" }, { status: 404 });
      }

      const ext = filename.split(".").pop()?.toLowerCase() ?? "";
      const mimeTypes: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        mp4: "video/mp4",
        webm: "video/webm"
      };

      const mimeType = mimeTypes[ext] ?? "application/octet-stream";

      return new Response(createReadStream(filepath) as never, {
        headers: {
          "Content-Type": mimeType
        }
      });
    }

    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      const response = await router(req);
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    } catch (err) {
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}`);