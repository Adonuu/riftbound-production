import ArtTypes from "./artTypes";

class Card {
    code: string;
    tcgId: string;
    name: string;
    type: string;
    artTypeId: number;
    artType?: string;
    imageUrl: string;

    constructor(id: string, tcgId: string, name: string, type: string, artTypeId: number, imageUrl: string, artType?: string) {
        this.code = id;
        this.tcgId = tcgId;
        this.name = name;
        this.type = type;
        this.artTypeId = artTypeId;
        this.artType = artType;
        this.imageUrl = imageUrl;
    }
}

export default Card;