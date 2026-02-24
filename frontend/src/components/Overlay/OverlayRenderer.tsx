import { useMemo } from 'react';
import { Overlay } from '../../context/OverlayContext';
import OverlayItem from './OverlayItem';

const ANIMATION_CLASSES: Record<string, string> = {
    fade: 'overlay-fade',
    slide: 'overlay-slide',
    zoom: 'overlay-zoom',
    'slide-fade': 'overlay-slide-fade',
    none: 'overlay-none',
};

const DIRECTION_CLASSES: Record<string, string> = {
    'left-to-right': 'direction-left-to-right',
    'right-to-left': 'direction-right-to-left',
    'top-to-bottom': 'direction-top-to-bottom',
    'bottom-to-top': 'direction-bottom-to-top',
};

interface OverlayRendererProps {
    overlays: Overlay[];
}

export default function OverlayRenderer({ overlays }: OverlayRendererProps) {
    const sortedOverlays = useMemo(() => 
        [...overlays].sort((a, b) => a.order - b.order), 
        [overlays]
    );

    const renderOverlay = (overlay: Overlay) => {
        if (!overlay.components || overlay.components.length === 0) {
            return null;
        }

        return (
            <div
                className={`overlay-container ${ANIMATION_CLASSES[overlay.showAnimation] || ''} ${DIRECTION_CLASSES[overlay.showAnimationDirection || ''] || ''}`}
                style={{
                    animationDuration: `${overlay.showAnimationDuration}ms`,
                }}
            >
                {overlay.components
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map((component) => (
                        <OverlayItem key={component.id} component={component} />
                    ))}
            </div>
        );
    };

    return (
        <div className="overlay-renderer">
            {sortedOverlays.map((overlay) => (
                <div key={overlay.id} className="overlay-wrapper">
                    {renderOverlay(overlay)}
                </div>
            ))}
        </div>
    );
}
