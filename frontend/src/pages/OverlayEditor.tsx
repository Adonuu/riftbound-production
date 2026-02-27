import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { useOverlays, Overlay, Component } from '../context/OverlayContext';
import './pages.css';

const API_BASE = 'http://localhost:3000';

export default function OverlayEditor() {
    const { id } = useParams<{ id: string }>();
    const { overlays, updateOverlay, addComponent, updateComponent, deleteComponent, deleteOverlay } = useOverlays();
    const [overlay, setOverlay] = useState<Overlay | null>(null);
    const [components, setComponents] = useState<Component[]>([]);
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
    const [deleted, setDeleted] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const updateSize = () => {
            if (canvasRef.current) {
                const { width, height } = canvasRef.current.getBoundingClientRect();
                setCanvasSize({ width, height });
            }
        };

        const timeout = setTimeout(updateSize, 50);
        
        const resizeObserver = new ResizeObserver(updateSize);
        
        if (canvasRef.current) {
            resizeObserver.observe(canvasRef.current);
        }

        return () => {
            clearTimeout(timeout);
            resizeObserver.disconnect();
        };
    }, []);

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

    const refreshComponents = useCallback(async () => {
        if (!overlay?.id) return;
        const compRes = await fetch(`${API_BASE}/api/overlays/${overlay.id}/components`);
        const compData = await compRes.json();
        setComponents(compData);
    }, [overlay?.id]);

    const handleNameChange = async (name: string) => {
        if (!overlay?.id || !name.trim()) return;
        await updateOverlay(overlay.id, { name: name.trim() });
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
                        x: 25,
                        y: 25,
                        width: 50,
                        height: 50,
                        zIndex: components.length,
                    });
                    
                    await refreshComponents();
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
            type: 'text' as const,
            content: 'New Text',
            x: 25,
            y: 25,
            width: 50,
            height: 50,
            zIndex: components.length,
        });
        await refreshComponents();
    };

    const handleDragStop = useCallback(async (compId: number, data: { x: number; y: number }) => {
        if (!compId) return;
        const xPercent = (data.x / canvasSize.width) * 100;
        const yPercent = (data.y / canvasSize.height) * 100;
        
        await updateComponent(compId, { x: xPercent, y: yPercent });
        await refreshComponents();
    }, [canvasSize, updateComponent, refreshComponents]);

    const handleResizeStop = useCallback(async (
        compId: number,
        data: { node: HTMLElement; size: { width: number; height: number } }
    ) => {
        if (!compId) return;
        const widthPercent = (data.size.width / canvasSize.width) * 100;
        const heightPercent = (data.size.height / canvasSize.height) * 100;
        
        await updateComponent(compId, { width: widthPercent, height: heightPercent });
        await refreshComponents();
    }, [canvasSize, updateComponent, refreshComponents]);

    const handlePositionSizeChange = async (field: 'x' | 'y' | 'width' | 'height', value: number) => {
        if (!selectedComponent?.id) return;
        
        const updated = { ...selectedComponent, [field]: value };
        setSelectedComponent(updated);
        setComponents(prev => prev.map(c => 
            c.id === selectedComponent.id ? updated : c
        ));
        
        await updateComponent(selectedComponent.id, { [field]: value });
    };

    const handleContentChange = async (value: string) => {
        if (!selectedComponent?.id) return;
        
        const updated = { ...selectedComponent, content: value };
        setSelectedComponent(updated);
        setComponents(prev => prev.map(c => 
            c.id === selectedComponent.id ? updated : c
        ));
        
        await updateComponent(selectedComponent.id, { content: value });
    };

    const handleUpdateComponent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComponent?.id) return;
        
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        await updateComponent(selectedComponent.id, {
            name: formData.get('name') as string || selectedComponent.name,
            type: formData.get('type') as 'image' | 'text' | 'video',
            content: formData.get('content') as string,
            zIndex: parseInt(formData.get('zIndex') as string) || 0,
        });
        
        await refreshComponents();
        setSelectedComponent(null);
    };

    const handleDeleteComponent = async (componentId: number) => {
        await deleteComponent(componentId);
        await refreshComponents();
        setSelectedComponent(null);
    };

    const handleDeleteOverlay = async () => {
        if (!overlay?.id) return;
        await deleteOverlay(overlay.id);
        setDeleted(true);
    };

    const renderComponentContent = (comp: Component) => {
        switch (comp.type) {
            case 'image':
                return <img src={comp.content} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />;
            case 'video':
                return <video src={comp.content} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />;
            case 'text':
                return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', boxSizing: 'border-box', overflow: 'hidden', color: 'white', fontSize: '24px' }}>{comp.content}</div>;
            default:
                return null;
        }
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
                <Link to="/overlays" className="back-link">← Back</Link>
                <input
                    type="text"
                    value={overlay.name}
                    onChange={(e) => setOverlay({ ...overlay, name: e.target.value })}
                    onBlur={(e) => handleNameChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    className="overlay-name-input"
                />
                <button onClick={handleDeleteOverlay} className="delete-btn">Delete</button>
            </div>
            
            <div className="editor-layout">
                <div className="editor-canvas-container">
                    <div 
                        ref={canvasRef}
                        className="editor-canvas"
                    >
                        {canvasSize.width > 0 && canvasSize.height > 0 && components.map((comp) => (
                            <Rnd
                                key={comp.id}
                                size={{ width: (comp.width / 100) * canvasSize.width, height: (comp.height / 100) * canvasSize.height }}
                                position={{ x: (comp.x / 100) * canvasSize.width, y: (comp.y / 100) * canvasSize.height }}
                                bounds="parent"
                                onDragStop={(e, d) => handleDragStop(comp.id!, d)}
                                onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(comp.id!, { node: ref, size: { width: ref.offsetWidth, height: ref.offsetHeight } })}
                                onClick={() => setSelectedComponent(comp)}
                                className={`canvas-component ${selectedComponent?.id === comp.id ? 'selected' : ''}`}
                                enableResizing={{
                                    top: true,
                                    right: true,
                                    bottom: true,
                                    left: true,
                                    topRight: true,
                                    bottomRight: true,
                                    bottomLeft: true,
                                    topLeft: true
                                }}
                            >
                                {renderComponentContent(comp)}
                            </Rnd>
                        ))}
                        
                        {components.length === 0 && (
                            <div className="canvas-empty">
                                <p>Add elements from the toolbar below</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="editor-bottom-panel">
                    <div className="toolbar">
                        <button onClick={() => handleUpload('image')} disabled={uploading} className="toolbar-btn">
                            + Image
                        </button>
                        <button onClick={handleAddText} className="toolbar-btn">
                            + Text
                        </button>
                        <button onClick={() => handleUpload('video')} disabled={uploading} className="toolbar-btn">
                            + Video
                        </button>
                    </div>

                    {selectedComponent ? (
                        <div className="property-panel">
                            <div className="property-header">
                                <h4>Edit: {selectedComponent.name}</h4>
                                <button onClick={() => handleDeleteComponent(selectedComponent.id!)} className="delete-btn">Delete</button>
                            </div>
                            <form onSubmit={handleUpdateComponent}>
                                <label>
                                    Name:
                                    <input type="text" name="name" defaultValue={selectedComponent.name} required />
                                </label>
                                <label>
                                    Type:
                                    <select name="type" defaultValue={selectedComponent.type}>
                                        <option value="text">Text</option>
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                    </select>
                                </label>
                                <label>
                                    Content:
                                    <input 
                                        type="text" 
                                        value={components.find(c => c.id === selectedComponent.id)?.content ?? selectedComponent.content} 
                                        onChange={(e) => handleContentChange(e.target.value)}
                                        required 
                                    />
                                </label>
                                <div className="property-row">
                                    <label>
                                        X (%):
                                        <input 
                                            type="number" 
                                            value={components.find(c => c.id === selectedComponent.id)?.x ?? selectedComponent.x} 
                                            onChange={(e) => handlePositionSizeChange('x', parseFloat(e.target.value) || 0)}
                                            step="0.1" 
                                        />
                                    </label>
                                    <label>
                                        Y (%):
                                        <input 
                                            type="number" 
                                            value={components.find(c => c.id === selectedComponent.id)?.y ?? selectedComponent.y} 
                                            onChange={(e) => handlePositionSizeChange('y', parseFloat(e.target.value) || 0)}
                                            step="0.1" 
                                        />
                                    </label>
                                </div>
                                <div className="property-row">
                                    <label>
                                        Width (%):
                                        <input 
                                            type="number" 
                                            value={components.find(c => c.id === selectedComponent.id)?.width ?? selectedComponent.width} 
                                            onChange={(e) => handlePositionSizeChange('width', parseFloat(e.target.value) || 0)}
                                            step="1" 
                                        />
                                    </label>
                                    <label>
                                        Height (%):
                                        <input 
                                            type="number" 
                                            value={components.find(c => c.id === selectedComponent.id)?.height ?? selectedComponent.height} 
                                            onChange={(e) => handlePositionSizeChange('height', parseFloat(e.target.value) || 0)}
                                            step="1" 
                                        />
                                    </label>
                                </div>
                                <label>
                                    Z-Index:
                                    <input type="number" name="zIndex" defaultValue={selectedComponent.zIndex} />
                                </label>
                                <div className="form-buttons">
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setSelectedComponent(null)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="property-panel property-panel-empty">
                            <p>Select an element on the canvas to edit its properties</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
