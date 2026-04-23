/**
 * Fixed full-viewport ambient background layer.
 * 3 drifting blobs (green, blue, faint blue) + subtle dotted grid with vignette.
 * Rendered once at the root layout — stays behind everything via z-index: 0.
 */
export default function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="grid" />
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </div>
  );
}
