import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3000';

export interface Component {
    id?: number;
    overlayId: number;
    name: string;
    type: 'image' | 'text' | 'video';
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
}

export interface Overlay {
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
    components?: Component[];
}

interface OverlayContextType {
    overlays: Overlay[];
    loading: boolean;
    setOverlayOnPreview: (id: number, on: boolean) => Promise<void>;
    setOverlayOnOutput: (id: number, on: boolean) => Promise<void>;
    createOverlay: (name: string) => Promise<void>;
    updateOverlay: (id: number, data: Partial<Overlay>) => Promise<void>;
    deleteOverlay: (id: number) => Promise<void>;
    addComponent: (overlayId: number, component: Omit<Component, 'id' | 'overlayId'>) => Promise<void>;
    updateComponent: (id: number, data: Partial<Component>) => Promise<void>;
    deleteComponent: (id: number) => Promise<void>;
    refreshOverlays: () => Promise<void>;
}

const OverlayContext = createContext<OverlayContextType | null>(null);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
    const [overlays, setOverlays] = useState<Overlay[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshOverlays = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/overlays`);
            const data = await res.json();
            setOverlays(data);
        } catch (err) {
            console.error('Failed to fetch overlays:', err);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await refreshOverlays();
            setLoading(false);
        };
        init();
    }, [refreshOverlays]);

    const setOverlayOnPreview = async (id: number, on: boolean) => {
        try {
            await fetch(`${API_BASE}/api/overlays/${id}/set-preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ on }),
            });
            await refreshOverlays();
        } catch (err) {
            console.error('Failed to set overlay on preview:', err);
        }
    };

    const setOverlayOnOutput = async (id: number, on: boolean) => {
        try {
            await fetch(`${API_BASE}/api/overlays/${id}/set-output`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ on }),
            });
            await refreshOverlays();
        } catch (err) {
            console.error('Failed to set overlay on output:', err);
        }
    };

    const createOverlay = async (name: string) => {
        try {
            await fetch(`${API_BASE}/api/overlays`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            await refreshOverlays();
        } catch (err) {
            console.error('Failed to create overlay:', err);
        }
    };

    const updateOverlay = async (id: number, data: Partial<Overlay>) => {
        try {
            await fetch(`${API_BASE}/api/overlays/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            await refreshOverlays();
        } catch (err) {
            console.error('Failed to update overlay:', err);
        }
    };

    const deleteOverlay = async (id: number) => {
        try {
            await fetch(`${API_BASE}/api/overlays/${id}`, { method: 'DELETE' });
            await refreshOverlays();
        } catch (err) {
            console.error('Failed to delete overlay:', err);
        }
    };

    const addComponent = async (overlayId: number, component: Omit<Component, 'id' | 'overlayId'>) => {
        try {
            await fetch(`${API_BASE}/api/overlays/${overlayId}/components`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(component),
            });
            await refreshOverlays();
        } catch (err) {
            console.error('Failed to add component:', err);
        }
    };

    const updateComponent = async (id: number, data: Partial<Component>) => {
        try {
            await fetch(`${API_BASE}/api/components/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            await refreshOverlays();
        } catch (err) {
            console.error('Failed to update component:', err);
        }
    };

    const deleteComponent = async (id: number) => {
        try {
            await fetch(`${API_BASE}/api/components/${id}`, { method: 'DELETE' });
            await refreshOverlays();
        } catch (err) {
            console.error('Failed to delete component:', err);
        }
    };

    return (
        <OverlayContext.Provider value={{
            overlays,
            loading,
            setOverlayOnPreview,
            setOverlayOnOutput,
            createOverlay,
            updateOverlay,
            deleteOverlay,
            addComponent,
            updateComponent,
            deleteComponent,
            refreshOverlays,
        }}>
            {children}
        </OverlayContext.Provider>
    );
}

export function useOverlays() {
    const context = useContext(OverlayContext);
    if (!context) {
        throw new Error('useOverlays must be used within an OverlayProvider');
    }
    return context;
}
