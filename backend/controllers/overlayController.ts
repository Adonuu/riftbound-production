import db from "../database/cardDatabase";
import Overlay from "../models/overlay";
import Component from "../models/component";

export const getAllOverlays = (): Overlay[] => {
    return db.query("SELECT * FROM overlays ORDER BY \"order\"").all() as Overlay[];
};

export const getOverlayById = (id: number): Overlay | null => {
    return db.query("SELECT * FROM overlays WHERE id = ?").get(id) as Overlay | null;
};

export const getOverlaysForPreview = (): Overlay[] => {
    return db.query("SELECT * FROM overlays WHERE isOnPreview = 1 ORDER BY \"order\"").all() as Overlay[];
};

export const getOverlaysForOutput = (): Overlay[] => {
    return db.query("SELECT * FROM overlays WHERE isOnOutput = 1 ORDER BY \"order\"").all() as Overlay[];
};

export const createOverlay = (overlay: Overlay): Overlay => {
    const maxOrder = db.query("SELECT MAX(\"order\") as max FROM overlays").get() as { max: number | null };
    const newOrder = (maxOrder?.max ?? -1) + 1;
    
    const result = db.prepare(`
        INSERT INTO overlays (name, "order", showAnimation, showAnimationDirection, showAnimationDuration, hideAnimation, hideAnimationDirection, hideAnimationDuration, isOnPreview, isOnOutput)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `).run(
        overlay.name,
        newOrder,
        overlay.showAnimation,
        overlay.showAnimationDirection,
        overlay.showAnimationDuration,
        overlay.hideAnimation,
        overlay.hideAnimationDirection,
        overlay.hideAnimationDuration
    );

    return getOverlayById(Number(result.lastInsertRowid)) as Overlay;
};

export const updateOverlay = (id: number, overlay: Partial<Overlay>): Overlay | null => {
    const existing = getOverlayById(id);
    if (!existing) return null;

    const updated = { ...existing, ...overlay };

    db.prepare(`
        UPDATE overlays SET
            name = ?,
            "order" = ?,
            showAnimation = ?,
            showAnimationDirection = ?,
            showAnimationDuration = ?,
            hideAnimation = ?,
            hideAnimationDirection = ?,
            hideAnimationDuration = ?,
            isOnPreview = ?,
            isOnOutput = ?
        WHERE id = ?
    `).run(
        updated.name,
        updated.order,
        updated.showAnimation,
        updated.showAnimationDirection,
        updated.showAnimationDuration,
        updated.hideAnimation,
        updated.hideAnimationDirection,
        updated.hideAnimationDuration,
        updated.isOnPreview,
        updated.isOnOutput,
        id
    );

    return getOverlayById(id);
};

export const deleteOverlay = (id: number): boolean => {
    const result = db.prepare("DELETE FROM overlays WHERE id = ?").run(id);
    return result.changes > 0;
};

export const setOverlayOnPreview = (id: number, on: boolean): Overlay | null => {
    db.prepare("UPDATE overlays SET isOnPreview = ? WHERE id = ?").run(on ? 1 : 0, id);
    return getOverlayById(id);
};

export const setOverlayOnOutput = (id: number, on: boolean): Overlay | null => {
    db.prepare("UPDATE overlays SET isOnOutput = ? WHERE id = ?").run(on ? 1 : 0, id);
    return getOverlayById(id);
};

export const getOverlayComponents = (overlayId: number): Component[] => {
    return db.query("SELECT * FROM components WHERE overlayId = ? ORDER BY zIndex").all(overlayId) as Component[];
};

export const createComponent = (component: Component): Component => {
    const result = db.prepare(`
        INSERT INTO components (overlayId, name, type, content, x, y, width, height, zIndex)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        component.overlayId,
        component.name,
        component.type,
        component.content,
        component.x,
        component.y,
        component.width,
        component.height,
        component.zIndex
    );

    return db.query("SELECT * FROM components WHERE id = ?").get(Number(result.lastInsertRowid)) as Component;
};

export const updateComponent = (id: number, component: Partial<Component>): Component | null => {
    const existing = db.query("SELECT * FROM components WHERE id = ?").get(id) as Component | null;
    if (!existing) return null;

    const updated = { ...existing, ...component };

    db.prepare(`
        UPDATE components SET
            overlayId = ?,
            name = ?,
            type = ?,
            content = ?,
            x = ?,
            y = ?,
            width = ?,
            height = ?,
            zIndex = ?
        WHERE id = ?
    `).run(
        updated.overlayId,
        updated.name,
        updated.type,
        updated.content,
        updated.x,
        updated.y,
        updated.width,
        updated.height,
        updated.zIndex,
        id
    );

    return db.query("SELECT * FROM components WHERE id = ?").get(id) as Component;
};

export const deleteComponent = (id: number): boolean => {
    const result = db.prepare("DELETE FROM components WHERE id = ?").run(id);
    return result.changes > 0;
};
