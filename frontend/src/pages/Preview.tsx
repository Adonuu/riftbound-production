import { useState, useEffect } from 'react';
import OverlayRenderer from '../components/Overlay/OverlayRenderer';
import { Overlay } from '../context/OverlayContext';
import './pages.css';

const API_BASE = 'http://localhost:3000';

export default function Preview() {
    const [overlays, setOverlays] = useState<Overlay[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Preview';
    }, []);

    useEffect(() => {
        const fetchOverlays = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/overlays/preview`);
                const data: Overlay[] = await res.json();
                setOverlays(data);
            } catch (err) {
                console.error('Failed to fetch overlays:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOverlays();
        const interval = setInterval(fetchOverlays, 2000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="page-container centered">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="page-container centered fullscreen output-page">
            <OverlayRenderer overlays={overlays} />
        </div>
    );
}
