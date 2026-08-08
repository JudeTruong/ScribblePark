import { useMemo, useState } from "react";
import World from "./world/World";
import DrawingCanvas from "./drawing/DrawingCanvas";

function randomPlacement() {
  return {
    position: {
      x: Math.random() * 8 - 4,
      y: 0,
      z: Math.random() * 5 - 2.5,
    },
    scale: 0.9 + Math.random() * 0.5,
  };
}

export default function App() {
  const [step, setStep] = useState("landing");
  const [creations, setCreations] = useState([]);

  function handleAddDrawing({ previewUrl }) {
    const placement = randomPlacement();

    const newCreation = {
      id: `entry-${Date.now()}`,
      name: "Flower",
      description: "Hand-drawn flower",
      imageUrl: previewUrl,
      position: placement.position,
      scale: placement.scale,
    };

    setCreations((current) => [...current, newCreation]);
    setStep("world");
  }

  const summary = useMemo(() => {
    if (creations.length === 0) return "No creations yet";
    return `${creations.length} creation${creations.length > 1 ? "s" : ""} in the world`;
  }, [creations]);

  if (step === "world") {
    return (
      <div style={{ width: "100%", height: "100vh" }}>
        <div style={floatingCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ margin: "0 0 8px" }}>Your park is growing</h2>
              <p style={{ margin: 0 }}>{summary}</p>
            </div>
            <button onClick={() => setStep("form")} style={secondaryButtonStyle}>
              Add another
            </button>
          </div>
        </div>
        <World creations={creations} />
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={eyebrowStyle}>ScribblePark</p>
        <h1 style={{ margin: "0 0 12px", fontSize: "36px" }}>
          {step === "landing" ? "Add something to the park" : "Draw and plant a flower"}
        </h1>
        <p style={{ margin: "0 0 24px", color: "#5f6f5f" }}>
          {step === "landing"
            ? "Start with a tiny idea and place it into the world."
            : "Draw a flower, give it a name, and add it to the meadow."}
        </p>

        {step === "landing" ? (
          <button onClick={() => setStep("form")} style={primaryButtonStyle}>
            Add something
          </button>
        ) : (
          <div style={{ display: "grid", gap: "24px" }}>
            <DrawingCanvas onComplete={handleAddDrawing} />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setStep("landing")} style={secondaryButtonStyle}>
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #f8f4e8 0%, #e5f0d9 100%)",
  padding: "24px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "460px",
  background: "#fffdf8",
  borderRadius: "24px",
  padding: "28px",
  boxShadow: "0 16px 40px rgba(33, 53, 35, 0.16)",
};

const eyebrowStyle = {
  margin: 0,
  color: "#7b9473",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontSize: "12px",
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: "999px",
  padding: "12px 18px",
  background: "#315638",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  border: "1px solid #d4dfcf",
  borderRadius: "999px",
  padding: "12px 18px",
  background: "white",
  color: "#315638",
  fontWeight: 700,
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  border: "1px solid #d7e0d0",
  borderRadius: "12px",
  padding: "12px 14px",
  fontSize: "15px",
  boxSizing: "border-box",
};

const floatingCardStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 20,
  background: "rgba(255, 253, 244, 0.95)",
  padding: "16px 18px",
  borderRadius: "16px",
  boxShadow: "0 10px 28px rgba(33, 53, 35, 0.16)",
  maxWidth: "300px",
};

