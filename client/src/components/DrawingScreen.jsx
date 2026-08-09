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
      <header style={styles.header}>
        <h1 style={styles.title}>🌼 ScribblePark</h1>
        <p style={styles.subtitle}>
          Draw something, name it, and plant it in the meadow.
        </p>
      </header>

      <main style={styles.canvasArea}>
        <DrawingCanvas onComplete={onComplete} />
      </main>

      <footer style={styles.footer}>
        <p style={styles.hint}>
          Every drawing you plant stays in the meadow — even after you refresh.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "24px",
    padding: "48px 16px",
    background: "linear-gradient(180deg, #fdedc4 0%, #f7e2ae 100%)",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    textAlign: "center",
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
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  footer: {
    marginTop: "8px",
  },
  hint: {
    fontSize: "13px",
    color: "#8c6f3a",
    textAlign: "center",
  },
};
