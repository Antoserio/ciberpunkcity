export default function Studio360VideoOverlay() {
  return (
    <div
      className="absolute z-10 overflow-hidden pointer-events-none"
      style={{
        left: '39.2%',
        top: '26.4%',
        width: '15.6%',
        height: '26.5%',
        transform: 'perspective(1200px) rotateY(-6deg) rotateX(1deg)',
        transformOrigin: 'center center',
        boxShadow: '0 0 24px rgba(255, 0, 255, 0.35)',
        border: '2px solid rgba(255, 0, 255, 0.65)',
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
  );
}