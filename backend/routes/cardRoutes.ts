import { getAllCards, getCardById } from "../controllers/cardController";

export const cardRoutes: Record<string, Partial<Record<string, (req: Request) => Response | Promise<Response>>>> = {
  "/api/cards": {
    GET: () => {
      const cards = getAllCards();
      return Response.json(cards);
    },
  },
  "/api/cards/:id": {
    GET: (req: Request) => {
      const url = new URL(req.url);
      const id = parseInt(url.pathname.split("/").pop() ?? "");

      if (isNaN(id)) {
        return Response.json({ error: "Invalid ID" }, { status: 400 });
      }

      const card = getCardById(id);

      if (!card) {
        return Response.json({ error: "Card not found" }, { status: 404 });
      }

      return Response.json(card);
    },
  },
};