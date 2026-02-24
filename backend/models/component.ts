class Component {
    id?: number;
    overlayId: number;
    name: string;
    type: "image" | "text" | "video";
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;

    constructor(
        overlayId: number,
        name: string,
        type: "image" | "text" | "video",
        content: string,
        x: number = 0,
        y: number = 0,
        width: number = 100,
        height: number = 100,
        zIndex: number = 0,
        id?: number
    ) {
        this.overlayId = overlayId;
        this.name = name;
        this.type = type;
        this.content = content;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.zIndex = zIndex;
        this.id = id;
    }
}

export default Component;
