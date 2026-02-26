import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOverlays, Overlay, Component } from '../context/OverlayContext';
import './pages.css';

const API_BASE = 'http://localhost:3000';

const ANIMATIONS = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'slide-fade', label: 'Slide + Fade' },
];

const DIRECTIONS = [
    { value: '', label: 'None' },
    { value: 'left-to-right', label: 'Left to Right' },
    { value: 'right-to-left', label: 'Right to Left' },
    { value: 'top-to-bottom', label: 'Top to Bottom' },
    { value: 'bottom-to-top', label: 'Bottom to Top' },
];

export default function OverlayEditor() {
    const { id } = useParams<{ id: string }>();
    const { overlays, updateOverlay, addComponent, updateComponent, deleteComponent, deleteOverlay } = useOverlays();
    const [overlay, setOverlay] = useState<Overlay | null>(null);
    const [components, setComponents] = useState<Component[]>([]);
    const [editingComponent, setEditingComponent] = useState<Component | null>(null);
    const [deleted, setDeleted] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchOverlay = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/overlays/${id}`);
                if (!res.ok) {
                    setDeleted(true);
                    return;
                }
                const data = await res.json();
                setOverlay(data);
                
                const compRes = await fetch(`${API_BASE}/api/overlays/${id}/components`);
                const compData = await compRes.json();
                setComponents(compData);
            } catch (err) {
                console.error('Failed to fetch overlay:', err);
            }
        };
        if (id) {
            fetchOverlay();
        }
    }, [id, overlays]);

    useEffect(() => {
        if (overlays.length > 0 && id) {
            const found = overlays.find(o => o.id === Number(id));
            if (!found) {
                setDeleted(true);
            }
        }
    }, [id, overlays]);

    const handleNameChange = async (name: string) => {
        if (!overlay?.id || !name.trim()) return;
        await updateOverlay(overlay.id, { name: name.trim() });
    };

    const handleAnimationChange = async (field: string, value: string | number) => {
        if (!overlay?.id) return;
        await updateOverlay(overlay.id, { [field]: value });
        setOverlay({ ...overlay, [field]: value });
    };

    const handleUpload = async (type: 'image' | 'video') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'image' ? 'image/*' : 'video/*';
        
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file || !overlay?.id) return;

            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch(`${API_BASE}/api/upload`, {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                
                if (data.path) {
                    const componentName = `${type === 'image' ? 'Image' : 'Video'} ${components.length + 1}`;
                    await addComponent(overlay.id, {
                        name: componentName,
                        type,
                        content: `${API_BASE}${data.path}`,
                        x: 0,
                        y: 0,
                        width: 100,
                        height: 100,
                        zIndex: components.length,
                    });
                    
                    const compRes = await fetch(`${API_BASE}/api/overlays/${overlay.id}/components`);
                    const compData = await compRes.json();
                    setComponents(compData);
                }
            } catch (err) {
                console.error('Upload failed:', err);
            } finally {
                setUploading(false);
            }
        };
        
        input.click();
    };

    const handleAddText = async () => {
        if (!overlay?.id) return;
        const componentName = `Text ${components.length + 1}`;
        await addComponent(overlay.id, {
            name: componentName,
            type: 'text',
            content: 'New Text',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            zIndex: components.length,
        });
        
        const compRes = await fetch(`${API_BASE}/api/overlays/${overlay.id}/components`);
        const compData = await compRes.json();
        setComponents(compData);
    };

    const handleUpdateComponent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingComponent?.id) return;
        
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        await updateComponent(editingComponent.id, {
            name: formData.get('name') as string || editingComponent.name,
            type: formData.get('type') as 'image' | 'text' | 'video',
            content: formData.get('content') as string,
            x: parseFloat(formData.get('x') as string) || 0,
            y: parseFloat(formData.get('y') as string) || 0,
            width: parseFloat(formData.get('width') as string) || 100,
            height: parseFloat(formData.get('height') as string) || 100,
            zIndex: parseInt(formData.get('zIndex') as string) || 0,
        });
        
        const compRes = await fetch(`${API_BASE}/api/overlays/${overlay?.id}/components`);
        const compData = await compRes.json();
        setComponents(compData);
        setEditingComponent(null);
    };

    const handleDeleteComponent = async (componentId: number) => {
        await deleteComponent(componentId);
        const compRes = await fetch(`${API_BASE}/api/overlays/${overlay?.id}/components`);
        const compData = await compRes.json();
        setComponents(compData);
    };

    const handleDeleteOverlay = async () => {
        if (!overlay?.id) return;
        await deleteOverlay(overlay.id);
        setDeleted(true);
    };

    if (deleted) {
        return (
            <div className="page-container overlay-editor">
                <div className="overlay-deleted-message">
                    <p>This overlay has been deleted.</p>
                    <Link to="/overlays">← Back to Overlay Manager</Link>
                </div>
            </div>
        );
    }

    if (!overlay) {
        return (
            <div className="page-container">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="page-container overlay-editor">
            <div className="overlay-editor-header">
                <Link to="/overlays" className="back-link">← Back to Overlay Manager</Link>
                <input
                    type="text"
                    value={overlay.name}
                    onChange={(e) => setOverlay({ ...overlay, name: e.target.value })}
                    onBlur={(e) => handleNameChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    className="overlay-name-input"
                />
                <button onClick={handleDeleteOverlay} className="delete-btn">Delete Overlay</button>
            </div>
            
            <div className="add-element-buttons">
                <button onClick={() => handleUpload('image')} disabled={uploading}>
                    + Add Image
                </button>
                <button onClick={handleAddText}>
                    + Add Text
                </button>
                <button onClick={() => handleUpload('video')} disabled={uploading}>
                    + Add Video
                </button>
            </div>

            <div className="components-section">
                <h3>Components</h3>
                
                <div className="component-list">
                    {components.map((comp) => (
                        <div key={comp.id} className="component-item">
                            <span className="component-name">{comp.name}</span>
                            <span className="component-type">{comp.type}: {comp.content.substring(0, 20)}...</span>
                            <button onClick={() => setEditingComponent(comp)}>Edit</button>
                            <button onClick={() => handleDeleteComponent(comp.id!)} className="delete-btn">X</button>
                        </div>
                    ))}
                </div>

                {components.length === 0 && (
                    <p className="no-components">No components yet. Use the buttons above to add elements.</p>
                )}
            </div>

            <div className="animation-settings">
                <h3>Show Animation</h3>
                <label>
                    Type:
                    <select
                        value={overlay.showAnimation}
                        onChange={(e) => handleAnimationChange('showAnimation', e.target.value)}
                    >
                        {ANIMATIONS.map((a) => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                    </select>
                </label>
                {overlay.showAnimation !== 'none' && overlay.showAnimation !== 'fade' && overlay.showAnimation !== 'zoom' && (
                    <label>
                        Direction:
                        <select
                            value={overlay.showAnimationDirection || ''}
                            onChange={(e) => handleAnimationChange('showAnimationDirection', e.target.value)}
                        >
                            {DIRECTIONS.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </label>
                )}
                <label>
                    Duration (ms):
                    <input
                        type="number"
                        value={overlay.showAnimationDuration}
                        onChange={(e) => handleAnimationChange('showAnimationDuration', parseInt(e.target.value))}
                    />
                </label>
            </div>

            <div className="animation-settings">
                <h3>Hide Animation</h3>
                <label>
                    Type:
                    <select
                        value={overlay.hideAnimation}
                        onChange={(e) => handleAnimationChange('hideAnimation', e.target.value)}
                    >
                        {ANIMATIONS.map((a) => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                    </select>
                </label>
                {overlay.hideAnimation !== 'none' && overlay.hideAnimation !== 'fade' && overlay.hideAnimation !== 'zoom' && (
                    <label>
                        Direction:
                        <select
                            value={overlay.hideAnimationDirection || ''}
                            onChange={(e) => handleAnimationChange('hideAnimationDirection', e.target.value)}
                        >
                            {DIRECTIONS.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </label>
                )}
                <label>
                    Duration (ms):
                    <input
                        type="number"
                        value={overlay.hideAnimationDuration}
                        onChange={(e) => handleAnimationChange('hideAnimationDuration', parseInt(e.target.value))}
                    />
                </label>
            </div>

            {editingComponent && (
                <div className="component-edit-form">
                    <h4>Edit Component</h4>
                    <form onSubmit={handleUpdateComponent}>
                        <label>
                            Name:
                            <input type="text" name="name" defaultValue={editingComponent.name} required />
                        </label>
                        <label>
                            Type:
                            <select name="type" defaultValue={editingComponent.type}>
                                <option value="text">Text</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </label>
                        <label>
                            Content (URL or text):
                            <input type="text" name="content" defaultValue={editingComponent.content} required />
                        </label>
                        <label>
                            X (%):
                            <input type="number" name="x" defaultValue={editingComponent.x} step="1" />
                        </label>
                        <label>
                            Y (%):
                            <input type="number" name="y" defaultValue={editingComponent.y} step="1" />
                        </label>
                        <label>
                            Width (%):
                            <input type="number" name="width" defaultValue={editingComponent.width} step="1" />
                        </label>
                        <label>
                            Height (%):
                            <input type="number" name="height" defaultValue={editingComponent.height} step="1" />
                        </label>
                        <label>
                            Z-Index:
                            <input type="number" name="zIndex" defaultValue={editingComponent.zIndex} />
                        </label>
                        <div className="form-buttons">
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setEditingComponent(null)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
