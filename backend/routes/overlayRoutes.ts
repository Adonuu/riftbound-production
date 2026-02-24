import {
    getAllOverlays,
    getOverlayById,
    getOverlaysForPreview,
    getOverlaysForOutput,
    createOverlay,
    updateOverlay,
    deleteOverlay,
    setOverlayOnPreview,
    setOverlayOnOutput,
    getOverlayComponents,
    createComponent,
    updateComponent,
    deleteComponent
} from "../controllers/overlayController";
import Overlay from "../models/overlay";
import Component from "../models/component";
import db from "../database/cardDatabase";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const UPLOAD_DIR = join(import.meta.dir, "uploads");

await mkdir(UPLOAD_DIR, { recursive: true });

const parseJsonBody = async (req: Request): Promise<Record<string, unknown>> => {
    try {
        return await req.json() as Record<string, unknown>;
    } catch {
        return {};
    }
};

export const overlayRoutes: Record<string, Partial<Record<string, (req: Request) => Response | Promise<Response>>>> = {
    "/api/overlays": {
        GET: () => {
            const overlays = getAllOverlays();
            return Response.json(overlays);
        },
        POST: async (req: Request) => {
            const body = await parseJsonBody(req);
            const overlay = new Overlay(
                body.name as string || "New Overlay",
                body.order as number || 0,
                body.showAnimation as string || "fade",
                body.showAnimationDirection as string || null,
                body.showAnimationDuration as number || 500,
                body.hideAnimation as string || "fade",
                body.hideAnimationDirection as string || null,
                body.hideAnimationDuration as number || 500
            );
            const created = createOverlay(overlay);
            return Response.json(created, { status: 201 });
        }
    },
    "/api/overlays/preview": {
        GET: () => {
            const overlays = getOverlaysForPreview();
            const overlaysWithComponents = overlays.map(overlay => ({
                ...overlay,
                components: getOverlayComponents(overlay.id!)
            }));
            return Response.json(overlaysWithComponents);
        }
    },
    "/api/overlays/output": {
        GET: () => {
            const overlays = getOverlaysForOutput();
            const overlaysWithComponents = overlays.map(overlay => ({
                ...overlay,
                components: getOverlayComponents(overlay.id!)
            }));
            return Response.json(overlaysWithComponents);
        }
    },
    "/api/overlays/:id": {
        GET: (req: Request) => {
            const id = parseInt(req.url.split("/").pop() || "");
            const overlay = getOverlayById(id);
            if (!overlay) return Response.json({ error: "Overlay not found" }, { status: 404 });
            return Response.json(overlay);
        },
        PUT: async (req: Request) => {
            const id = parseInt(req.url.split("/").pop() || "");
            const body = await parseJsonBody(req);
            const overlay = updateOverlay(id, body as Partial<Overlay>);
            if (!overlay) return Response.json({ error: "Overlay not found" }, { status: 404 });
            return Response.json(overlay);
        },
        DELETE: (req: Request) => {
            const id = parseInt(req.url.split("/").pop() || "");
            const deleted = deleteOverlay(id);
            if (!deleted) return Response.json({ error: "Overlay not found" }, { status: 404 });
            return Response.json({ success: true });
        }
    },
    "/api/overlays/:id/set-preview": {
        POST: async (req: Request) => {
            const id = parseInt(req.url.split("/").pop() || "");
            const body = await parseJsonBody(req);
            const on = body.on as boolean ?? true;
            const overlay = setOverlayOnPreview(id, on);
            if (!overlay) return Response.json({ error: "Overlay not found" }, { status: 404 });
            const components = getOverlayComponents(id);
            return Response.json({ ...overlay, components });
        }
    },
    "/api/overlays/:id/set-output": {
        POST: async (req: Request) => {
            const id = parseInt(req.url.split("/").pop() || "");
            const body = await parseJsonBody(req);
            const on = body.on as boolean ?? true;
            const overlay = setOverlayOnOutput(id, on);
            if (!overlay) return Response.json({ error: "Overlay not found" }, { status: 404 });
            const components = getOverlayComponents(id);
            return Response.json({ ...overlay, components });
        }
    },
    "/api/overlays/:id/components": {
        GET: (req: Request) => {
            const url = new URL(req.url);
            const pathParts = url.pathname.split("/");
            const overlayIdStr = pathParts[pathParts.length - 2];
            const overlayId = parseInt(overlayIdStr ?? "0");
            const components = getOverlayComponents(overlayId);
            return Response.json(components);
        },
        POST: async (req: Request) => {
            const url = new URL(req.url);
            const pathParts = url.pathname.split("/");
            const overlayIdStr = pathParts[pathParts.length - 2];
            const overlayId = parseInt(overlayIdStr ?? "0");
            const body = await parseJsonBody(req);
            
            const countResult = db.query("SELECT COUNT(*) as count FROM components WHERE overlayId = ?").get(overlayId) as { count: number };
            const componentNumber = countResult.count + 1;
            const defaultName = `Component ${componentNumber}`;
            
            const component = new Component(
                overlayId,
                body.name as string || defaultName,
                body.type as "image" | "text" | "video" || "text",
                body.content as string || "",
                body.x as number || 0,
                body.y as number || 0,
                body.width as number || 100,
                body.height as number || 100,
                body.zIndex as number || 0
            );
            const created = createComponent(component);
            return Response.json(created, { status: 201 });
        }
    },
    "/api/components/:id": {
        GET: (req: Request) => {
            const id = parseInt(req.url.split("/").pop() || "");
            const components = db.query("SELECT * FROM components WHERE id = ?").get(id);
            if (!components) return Response.json({ error: "Component not found" }, { status: 404 });
            return Response.json(components);
        },
        PUT: async (req: Request) => {
            const id = parseInt(req.url.split("/").pop() || "");
            const body = await parseJsonBody(req);
            const component = updateComponent(id, body as Partial<Component>);
            if (!component) return Response.json({ error: "Component not found" }, { status: 404 });
            return Response.json(component);
        },
        DELETE: (req: Request) => {
            const id = parseInt(req.url.split("/").pop() || "");
            const deleted = deleteComponent(id);
            if (!deleted) return Response.json({ error: "Component not found" }, { status: 404 });
            return Response.json({ success: true });
        }
    },
    "/api/upload": {
        POST: async (req: Request) => {
            const contentType = req.headers.get("content-type") || "";
            
            if (!contentType.includes("multipart/form-data")) {
                return Response.json({ error: "Content-Type must be multipart/form-data" }, { status: 400 });
            }

            const formData = await req.formData();
            const file = formData.get("file") as File | null;
            
            if (!file) {
                return Response.json({ error: "No file provided" }, { status: 400 });
            }

            const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
            if (!allowedTypes.includes(file.type)) {
                return Response.json({ error: "File type not allowed" }, { status: 400 });
            }

            const ext = file.name.split(".").pop() || "bin";
            const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const filepath = join(UPLOAD_DIR, filename);

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await writeFile(filepath, buffer);

            const isVideo = file.type.startsWith("video/");
            const isImage = file.type.startsWith("image/");
            let type: "image" | "video" = "image";
            if (isVideo) type = "video";

            return Response.json({
                filename,
                path: `/api/uploads/${filename}`,
                type,
                originalName: file.name
            }, { status: 201 });
        }
    },
    "/api/uploads/:filename": {
        GET: (req: Request) => {
            const filename = req.url.split("/").pop() || "";
            const filepath = join(UPLOAD_DIR, filename);
            
            if (!existsSync(filepath)) {
                return Response.json({ error: "File not found" }, { status: 404 });
            }

            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mimeTypes: Record<string, string> = {
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                png: "image/png",
                gif: "image/gif",
                webp: "image/webp",
                mp4: "video/mp4",
                webm: "video/webm"
            };

            const mimeType = mimeTypes[ext] || "application/octet-stream";
            
            return new Response(require("fs").createReadStream(filepath), {
                headers: {
                    "Content-Type": mimeType
                }
            });
        }
    }
};
