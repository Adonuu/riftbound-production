import { useState, useEffect } from 'react';
import { useOverlays, Component } from '../context/OverlayContext';
import { Link } from 'react-router-dom';
import './pages.css';

const API_BASE = 'http://localhost:3000';

const ANIMATIONS = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'slide-fade', label: 'Slide + Fade' },
];

export default function ProductionPanel() {
    const { overlays, setOverlayOnPreview, setOverlayOnOutput, updateOverlay, updateComponent, loading, refreshOverlays } = useOverlays();
    const [overlayComponents, setOverlayComponents] = useState<Record<number, Component[]>>({});
    const [editingText, setEditingText] = useState<{ componentId: number; value: string } | null>(null);

    useEffect(() => {
        const fetchComponents = async () => {
            const componentsMap: Record<number, Component[]> = {};
            for (const overlay of overlays) {
                try {
                    const res = await fetch(`${API_BASE}/api/overlays/${overlay.id}/components`);
                    const data = await res.json();
                    componentsMap[overlay.id!] = data;
                } catch (err) {
                    console.error('Failed to fetch components:', err);
                }
            }
            setOverlayComponents(componentsMap);
        };
        if (overlays.length > 0) {
            fetchComponents();
        }
    }, [overlays]);

    const handleAnimationChange = async (overlayId: number, animation: string) => {
        await updateOverlay(overlayId, { showAnimation: animation });
    };

    const handleTextSave = async (componentId: number) => {
        if (!editingText) return;
        await updateComponent(componentId, { content: editingText.value });
        setEditingText(null);
        refreshOverlays();
    };

    if (loading) {
        return (
            <div className="page-container">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="page-container production-panel">

            <div className="overlays-list">
                {overlays.map((overlay) => (
                    <div key={overlay.id} className="overlay-item">
                        <div className="overlay-header">
                            <span className="overlay-name">{overlay.name}</span>
                            <Link to={`/editor/${overlay.id}`} className="edit-button">Edit</Link>
                            <select
                                value={overlay.showAnimation}
                                onChange={(e) => handleAnimationChange(overlay.id!, e.target.value)}
                                className="animation-select"
                            >
                                {ANIMATIONS.map((anim) => (
                                    <option key={anim.value} value={anim.value}>{anim.label}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setOverlayOnPreview(overlay.id!, overlay.isOnPreview ? false : true)}
                                className={`toggle-button ${overlay.isOnPreview ? 'active' : ''}`}
                            >
                                Preview {overlay.isOnPreview ? '●' : '○'}
                            </button>
                            <button
                                onClick={() => setOverlayOnOutput(overlay.id!, overlay.isOnOutput ? false : true)}
                                className={`toggle-button ${overlay.isOnOutput ? 'active' : ''}`}
                            >
                                Output {overlay.isOnOutput ? '●' : '○'}
                            </button>
                        </div>
                        <div className="overlay-components">
                            {overlayComponents[overlay.id!]?.filter(c => c.type === 'text').map((comp) => (
                                <div key={comp.id} className="text-component-edit">
                                    <span className="text-label">Text: </span>
                                    {editingText?.componentId === comp.id ? (
                                        <input
                                            type="text"
                                            value={editingText.value}
                                            onChange={(e) => setEditingText({ componentId: comp.id!, value: e.target.value })}
                                            onBlur={() => handleTextSave(comp.id!)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleTextSave(comp.id!)}
                                            autoFocus
                                            className="text-input"
                                        />
                                    ) : (
                                        <span
                                            className="text-value"
                                            onClick={() => setEditingText({ componentId: comp.id!, value: comp.content })}
                                        >
                                            {comp.content}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {overlays.length === 0 && (
                    <p className="no-overlays">No overlays yet. <Link to="/overlays">Create one</Link></p>
                )}
            </div>
        </div>
    );
}
