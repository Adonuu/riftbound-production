import db from "../database/cardDatabase";
import Card from "../models/card";

export const getAllCards = (): Card[] => {
    return db.query("SELECT * FROM cards").all() as Card[];
}

export const getCardById = (id: number): Card | null => {
  return db.query("SELECT * FROM cards WHERE id = ?").get(id) as Card | null;
};