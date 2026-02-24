import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOverlays } from '../context/OverlayContext';
import './pages.css';

export default function OverlayManager() {
    const { overlays, createOverlay, deleteOverlay, loading } = useOverlays();
    const [newOverlayName, setNewOverlayName] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleCreate = async () => {
        if (newOverlayName.trim()) {
            await createOverlay(newOverlayName.trim());
            setNewOverlayName('');
            setShowForm(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="page-container overlay-manager">
            <div className="overlay-manager-header">
                <Link to="/" className="back-link">← Back to Control Panel</Link>
                <h1>Overlay Manager</h1>
            </div>

            <button onClick={() => setShowForm(true)}>+ Create New Overlay</button>
            
            {showForm && (
                <div className="create-overlay-form">
                    <input
                        type="text"
                        placeholder="Overlay name"
                        value={newOverlayName}
                        onChange={(e) => setNewOverlayName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        autoFocus
                    />
                    <div className="form-buttons">
                        <button onClick={handleCreate}>Create</button>
                        <button onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}
            
            <div className="overlay-list">
                {overlays.map((overlay) => (
                    <div key={overlay.id} className="overlay-item">
                        <span className="overlay-name">{overlay.name}</span>
                        <Link to={`/editor/${overlay.id}`} className="edit-link">Edit</Link>
                        <button onClick={() => deleteOverlay(overlay.id!)} className="delete-btn">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
