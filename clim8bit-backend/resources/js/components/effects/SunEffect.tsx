const sunImage = "/assets/images/icons/sun.png";

export function SunEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Sun positioned directly in the corner */}
      <img
        src={sunImage}
        alt="Sun"
        className="absolute top-1 right-2"
        style={{
          width: "300px",
          height: "300px",
          imageRendering: "pixelated",
          animation: "sunRayRotate 12s linear infinite",
        }}
      />
    </div>
  );
}