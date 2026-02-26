import React from 'react';

interface TextOverlayProps {
  textClips: Array<{
    id: string;
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    position: { x: number; y: number };
    startTime: number;
    duration: number;
    opacity: number;
    textAlign: 'left' | 'center' | 'right';
  }>;
  currentTime: number;
}

export default function TextOverlay({ textClips, currentTime }: TextOverlayProps) {
  const activeTextClips = textClips.filter(clip => 
    currentTime >= clip.startTime && 
    currentTime < clip.startTime + clip.duration
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {activeTextClips.map(clip => (
        <div
          key={clip.id}
          className="absolute inline-block px-3 py-2 rounded"
          style={{
            left: `${clip.position.x}%`,
            top: `${clip.position.y}%`,
            transform: clip.textAlign === 'left' ? 'translate(0, -50%)' : 
                      clip.textAlign === 'right' ? 'translate(-100%, -50%)' : 
                      'translate(-50%, -50%)',
            fontSize: `${clip.fontSize}px`,
            fontFamily: clip.fontFamily,
            color: clip.color,
            backgroundColor: clip.backgroundColor,
            opacity: clip.opacity,
            whiteSpace: 'pre-wrap', // Permite saltos de línea y wrapping
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            fontWeight: 'bold',
            textAlign: clip.textAlign,
          }}
        >
          {clip.text}
        </div>
      ))}
    </div>
  );
}
