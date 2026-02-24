import { cardRoutes } from "./routes/cardRoutes";
import { overlayRoutes } from "./routes/overlayRoutes";

type Handler = (req: Request) => Response | Promise<Response>;

const routes: Record<string, Partial<Record<string, Handler>>> = {
  ...cardRoutes,
  ...overlayRoutes,
};

export async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Check exact match first
  if (routes[pathname]) {
    const handler = routes[pathname][req.method];
    if (!handler) return Response.json({ error: "Method Not Allowed" }, { status: 405 });
    return handler(req);
  }

  // Handle dynamic routes e.g. /api/cards/1
  for (const route of Object.keys(routes)) {
    const routeParts = route.split("/");
    const pathParts = pathname.split("/");

    if (routeParts.length !== pathParts.length) continue;

    const match = routeParts.every((part, i) => part.startsWith(":") || part === pathParts[i]);

    if (match) {
      const handler = routes[route]?.[req.method];
      if (!handler) return Response.json({ error: "Method Not Allowed" }, { status: 405 });
      return handler(req);
    }
  }

  return Response.json({ error: "Not Found" }, { status: 404 });
}