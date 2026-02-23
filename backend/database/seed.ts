import db from "./cardDatabase";

const BASE_URL = "https://api.riftcodex.com/cards";

interface ApiResponse {
  items: ApiCard[];
  pages: number;
}

interface ApiCard {
  name: string;
  public_code: string;
  riftbound_id: string;
  classification?: {
    type?: string;
    supertype?: string;
  };
  metadata: {
    alternate_art: boolean;
    overnumbered?: boolean;
    signature?: boolean;
  };
  tags?: string[];
  media?: {
    image_url?: string;
  };
}

async function fetchPage(page: number): Promise<ApiResponse> {
  const url = page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`;
  const res = await fetch(url);
  return res.json() as Promise<ApiResponse>;
}

function getDisplayName(card: ApiCard): string {
  const type = card.classification?.type;
  return type === "Legend" ? `${card.tags?.[0]}, ${card.name}` : card.name ?? "";
}

function getDisplayType(card: ApiCard): string {
  const type = card.classification?.type;
  const supertype = card.classification?.supertype;
  return card.name?.includes("Starter") ? type ?? "" : supertype ?? type ?? "";
}

async function seed() {
  db.run("DELETE FROM cards");

  const firstPage = await fetchPage(1);
  const totalPages = firstPage.pages;

  const allCards = [...firstPage.items];

  for (let page = 2; page <= totalPages; page++) {
    console.log(`Fetching page ${page}/${totalPages}...`);
    const result = await fetchPage(page);
    allCards.push(...result.items);
  }

  const filtered = allCards.filter(
    (card) => !card.metadata?.overnumbered && !card.metadata?.signature
  );

  const insert = db.prepare(`
    INSERT OR IGNORE INTO cards (code, tcgId, name, type, artTypeId, imageUrl)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const getArtTypeId = db.prepare<{ id: number }, string>("SELECT id FROM arts WHERE name = ?");
  const normalArtTypeId = getArtTypeId.get("Normal")?.id ?? 1;
  const alternateArtTypeId = getArtTypeId.get("Alternate")?.id ?? 2;

  const insertMany = db.transaction((cards: ApiCard[]) => {
    for (const card of cards) {
      insert.run(
        card.public_code ?? "",
        card.riftbound_id ?? "",
        getDisplayName(card),
        getDisplayType(card),
        card.metadata.alternate_art ? alternateArtTypeId : normalArtTypeId,
        card.media?.image_url ?? ""
      );
    }
  });

  insertMany(filtered);
  console.log(`Seeded ${filtered.length} cards successfully.`);
}

seed();