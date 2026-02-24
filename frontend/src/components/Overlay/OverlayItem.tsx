import { useMemo } from 'react';
import { Component } from '../../context/OverlayContext';

interface OverlayItemProps {
    component: Component;
}

export default function OverlayItem({ component }: OverlayItemProps) {
    const { type, content, x, y, width, height, zIndex } = component;

    const style = useMemo(() => ({
        position: 'absolute' as const,
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        zIndex,
    }), [x, y, width, height, zIndex]);

    const renderContent = () => {
        switch (type) {
            case 'image':
                return (
                    <img
                        src={content}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                );
            case 'video':
                return (
                    <video
                        src={content}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        autoPlay
                        loop
                        muted
                    />
                );
            case 'text':
            default:
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    }}>
                        {content}
                    </div>
                );
        }
    };

    return (
        <div style={style}>
            {renderContent()}
        </div>
    );
}
