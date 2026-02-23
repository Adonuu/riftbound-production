import db from "../database/cardDatabase";
import Card from "../models/card";

export const getAllCards = (): Card[] => {
    return db.query(`
        SELECT c.id, c.code, c.tcgId, c.name, c.type, c.artTypeId, c.imageUrl, a.name as artType
        FROM cards c
        JOIN arts a ON c.artTypeId = a.id
    `).all() as Card[];
}

export const getCardById = (id: number): Card | null => {
  return db.query(`
      SELECT c.id, c.code, c.tcgId, c.name, c.type, c.artTypeId, c.imageUrl, a.name as artType
      FROM cards c
      JOIN arts a ON c.artTypeId = a.id
      WHERE c.id = ?
  `).get(id) as Card | null;
};