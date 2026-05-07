import React from 'react';

export default function Studio360VideoOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div
        className="absolute"
        style={{
          left: '29.2%',
          top: '12.5%',
          width: '13.8%',
          height: '25.5%',
          transform: 'perspective(1200px) rotateY(10deg) rotateX(1deg)',
          transformOrigin: 'center center',
        }}
      >
        <div
          className="w-full h-full border"
          style={{
            borderColor: 'rgba(255, 0, 255, 0.85)',
            boxShadow: '0 0 18px rgba(255, 0, 255, 0.55)',
            background: '#000',
          }}
        >
          <iframe
            className="w-full h-full"
            src="https://player.vimeo.com/video/641418395?autoplay=1&loop=1&muted=1&background=1&title=0&byline=0&portrait=0"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Studio 360 Video"
          />
        </div>
      </div>
    </div>
  );
}