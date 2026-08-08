import DrawingCanvas from "../drawing/DrawingCanvas";

// DrawingScreen is the page shell around DrawingCanvas — branding,
// instructions, and layout live here. All drawing/export logic stays
// inside DrawingCanvas; this component just passes onComplete through.
export default function DrawingScreen({ onComplete }) {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>🌼 ScribblePark</h1>
        <p style={styles.subtitle}>
          Draw a flower, name it, and plant it in the meadow.
        </p>
      </header>

      <main style={styles.canvasArea}>
        <DrawingCanvas onComplete={onComplete} />
      </main>

      <footer style={styles.footer}>
        <p style={styles.hint}>
          Every flower you plant stays in the meadow — even after you refresh.
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
    background: "linear-gradient(180deg, #fef6e4 0%, #f9f1d8 100%)",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "clamp(28px, 5vw, 40px)",
    color: "#3a5a40",
  },
  subtitle: {
    marginTop: "8px",
    fontSize: "16px",
    color: "#6b705c",
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
    color: "#a08963",
    textAlign: "center",
  },
};
