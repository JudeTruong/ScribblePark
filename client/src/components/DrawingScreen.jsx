import { useEffect } from "react";
import DrawingCanvas from "../drawing/DrawingCanvas";

// DrawingScreen is the page shell around DrawingCanvas — branding,
// instructions, and layout live here. All drawing/export logic stays
// inside DrawingCanvas; this component just passes onComplete through.
export default function DrawingScreen({ onComplete }) {
  // Load a rounded, bubbly font for the title
  useEffect(() => {
    const id = "scribblepark-font-fredoka";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.backgroundLayer} />
      <header style={styles.header}>
        <h1 style={styles.title}>ScribblePark</h1>
        <p style={styles.subtitle}>
          Draw something, name it, and plant it in the meadow.
        </p>
      </header>

      <main style={styles.canvasArea}>
        <DrawingCanvas onComplete={onComplete} />
      </main>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "24px",
    padding: "48px 16px",
    background: "#f7edc7",
    fontFamily: "'Fredoka', system-ui, sans-serif",
    overflow: "hidden",
  },
  backgroundLayer: {
    position: "absolute",
    inset: 0,
    backgroundImage: [
      "radial-gradient(circle at 15% 20%, rgba(243, 230, 164, 0.44) 0 16%, transparent 17%)",
      "radial-gradient(circle at 85% 18%, rgba(170, 206, 132, 0.32) 0 18%, transparent 19%)",
      "linear-gradient(135deg, #f8efbf 0%, #e6e9c2 45%, #d8e4b4 100%)",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 10px)",
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 10px)",
    ].join(", "),
    backgroundSize: "cover, cover, 180% 180%, 10px 10px, 10px 10px",
    backgroundPosition: "center, center, 0% 50%, 0 0, 0 0",
    animation: "meadowPulse 12s ease-in-out infinite",
    opacity: 1,
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    padding: "10px 18px",
    borderRadius: "8px",
    background: "#fff9e8",
    border: "2px solid #4d6b3b",
  },
  title: {
    margin: 0,
    fontSize: "clamp(30px, 5.5vw, 42px)",
    fontFamily: "'Fredoka', system-ui, sans-serif",
    fontWeight: 700,
    color: "#33502e",
    textShadow: "0 2px 0 rgba(255,255,255,0.5)",
  },
  subtitle: {
    marginTop: "8px",
    fontSize: "16px",
    color: "#5c6650",
  },
  canvasArea: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },

};
