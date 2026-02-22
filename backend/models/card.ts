import ArtTypes from "./artTypes";

class Card {
    code: string;
    tcgId: string;
    name: string;
    type: string;
    artType: ArtTypes;
    imageUrl: string;

    constructor(id: string, tcgId: string, name: string, type: string, artType: ArtTypes, imageUrl: string) {
        this.code = id;
        this.tcgId = tcgId;
        this.name = name;
        this.type = type;
        this.artType = artType;
        this.imageUrl = imageUrl;
    }
}

export default Card;