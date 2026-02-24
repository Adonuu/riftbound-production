class Overlay {
    id?: number;
    name: string;
    order: number;
    showAnimation: string;
    showAnimationDirection: string | null;
    showAnimationDuration: number;
    hideAnimation: string;
    hideAnimationDirection: string | null;
    hideAnimationDuration: number;
    isOnPreview: number;
    isOnOutput: number;

    constructor(
        name: string,
        order: number = 0,
        showAnimation: string = "fade",
        showAnimationDirection: string | null = null,
        showAnimationDuration: number = 500,
        hideAnimation: string = "fade",
        hideAnimationDirection: string | null = null,
        hideAnimationDuration: number = 500,
        isOnPreview: number = 0,
        isOnOutput: number = 0,
        id?: number
    ) {
        this.name = name;
        this.order = order;
        this.showAnimation = showAnimation;
        this.showAnimationDirection = showAnimationDirection;
        this.showAnimationDuration = showAnimationDuration;
        this.hideAnimation = hideAnimation;
        this.hideAnimationDirection = hideAnimationDirection;
        this.hideAnimationDuration = hideAnimationDuration;
        this.isOnPreview = isOnPreview;
        this.isOnOutput = isOnOutput;
        this.id = id;
    }
}

export default Overlay;
