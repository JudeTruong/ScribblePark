import { useEffect, useMemo, useState } from "react";
import World from "./world/World";
import DrawingCanvas from "./drawing/DrawingCanvas";
import DrawingScreen from "./components/DrawingScreen";
import { createCreation, getCreations } from "./api/creations";

const CLASS_SETTINGS = {
  flower: {
    minScale: 0.8,
    maxScale: 1.2,
    zone: "land",
  },

  tree: {
    minScale: 2,
    maxScale: 3,
    zone: "land",
  },

  bush: {
    minScale: 0.8,
    maxScale: 1.3,
    zone: "land",
  },

  mushroom: {
    minScale: 0.4,
    maxScale: 0.7,
    zone: "land",
  },

  rabbit: {
    minScale: 0.7,
    maxScale: 1,
    zone: "land",
  },

  toad: {
    minScale: 0.5,
    maxScale: 0.8,
    zone: "pondEdge",
  },

  bug: {
    minScale: 0.2,
    maxScale: 0.4,
    zone: "land",
  },

  snail: {
    minScale: 0.25,
    maxScale: 0.45,
    zone: "land",
  },

  butterfly: {
    minScale: 0.35,
    maxScale: 0.6,
    zone: "air",
  },

  bird: {
    minScale: 0.6,
    maxScale: 1,
    zone: "air",
  },

  fish: {
    minScale: 0.5,
    maxScale: 0.8,
    zone: "pond",
  },

  duck: {
    minScale: 0.7,
    maxScale: 1,
    zone: "pond",
  },
};

const CLASS_ALIASES = {
  flowers: "flower",
  plant: "flower",
  plants: "flower",

  bunny: "rabbit",
  frog: "toad",

  insect: "bug",
  ant: "bug",
  beetle: "bug",
  spider: "bug",

  bee: "butterfly",
  moth: "butterfly",

  fishes: "fish",
};

function normalizeClassification(value) {
    const classification = (
      value || "flower"
    ).toLowerCase();

  return (
    CLASS_ALIASES[classification] ||
    classification
  );
}

function randomScale(classification) {
  const settings =
    CLASS_SETTINGS[classification] ||
    CLASS_SETTINGS.flower;

  return (
    settings.minScale +
    Math.random() *
      (
        settings.maxScale -
        settings.minScale
      )
  );
}

function randomPlacement(classification) {
  const settings =
    CLASS_SETTINGS[classification] ||
    CLASS_SETTINGS.flower;

  const scale =
    randomScale(classification);

  // Fish and ducks appear inside the pond.
  if (settings.zone === "pond") {
    return {
      position: {
        x: 6 + Math.random() * 4 - 2,
        y: 0,
        z: 2 + Math.random() * 2 - 1,
      },
      scale,
    };
  }

  // Toads appear around the pond edge.
  if (settings.zone === "pondEdge") {
    const angle =
      Math.random() * Math.PI * 2;

    return {
      position: {
        x:
          6 +
          Math.cos(angle) * 4.5,
        y: 0,
        z:
          2 +
          Math.sin(angle) * 3.3,
      },
      scale,
    };
  }

  // Everything else appears on land.
  let x;
  let z;
  let insidePond;

  do {
    x = Math.random() * 24 - 12;
    z = Math.random() * 24 - 12;

    const pondX = (x - 6) / 4.8;
    const pondZ = (z - 2) / 3.7;

    insidePond =
      pondX ** 2 + pondZ ** 2 < 1;
  } while (insidePond);

  return {
    position: {
      x,
      y: 0,
      z,
    },
    scale,
  };
}

function displayCreationName(value) {
  const name = value?.trim();
  return name && name !== "Unnamed Creation"
    ? name
    : "Unnamed";
}

export default function App() {
  const [step, setStep] =
    useState("landing");

  const [creations, setCreations] =
    useState([]);

  useEffect(() => {
    getCreations()
      .then((savedCreations) =>
        setCreations(
          savedCreations.map((creation) => ({
            ...creation,
            name:
              displayCreationName(
                creation.name ||
                  creation.creatorName
              ),
          }))
        )
      )
      .catch(console.error);
  }, []);

  function handleAddDrawing({
    previewUrl,
    imageBlob,
    creatorName,
    type,
    confidence,
    predictions = [],
  }) {
    const normalizedClassification =
      normalizeClassification(
        type
      );

    const placement = randomPlacement(
      normalizedClassification
    );

    const displayName =
      displayCreationName(creatorName);

    const temporaryId = `temporary-${Date.now()}`;

    const temporaryCreation = {
      id: temporaryId,
      name: displayName,
      creatorName:
        displayName === "Unnamed"
          ? ""
          : displayName,
      description:
        `Hand-drawn ${type || normalizedClassification}`,
      classification:
        normalizedClassification,
      category:
        normalizedClassification,
      type,
      confidence,
      predictions,
      imageUrl: previewUrl,
      position: placement.position,
      scale: placement.scale,
      isPending: true,
    };

    setCreations((current) => [
      ...current,
      temporaryCreation,
    ]);

    setStep("world");

    createCreation({
      classification: normalizedClassification,
      creatorName:
        displayName === "Unnamed"
          ? ""
          : displayName,
      imageBlob,
      position: placement.position,
      scale: placement.scale,
    })
      .then((savedCreation) => {
        setCreations((current) =>
          current.map((creation) =>
            creation.id === temporaryId
              ? {
                  ...savedCreation,
                  name:
                    displayCreationName(
                      savedCreation.creatorName ||
                        displayName
                    ),
                  description: `Hand-drawn ${normalizedClassification}`,
                  category: normalizedClassification,
                  type,
                  confidence,
                  predictions,
                }
              : creation
          )
        );
      })
      .catch((error) => {
        console.error("Failed to save creation:", error);
      });
  }

  const summary = useMemo(() => {
    if (creations.length === 0) {
      return "No creations yet";
    }

    return `${creations.length} creation${
      creations.length > 1
        ? "s"
        : ""
    } in the world`;
  }, [creations]);

  if (step === "world") {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
          background: "linear-gradient(180deg, #fef5cb 0%, #e7f0c9 100%)",
        }}
      >
        <div style={floatingCardStyle}>
          <h2 style={{ margin: "0 0 6px", fontSize: "18px" }}>Your park is growing</h2>

          <p style={{ margin: "0 0 12px", lineHeight: 1.5 }}>
            {summary}
          </p>

          <button
            type="button"
            onClick={() => setStep("form")}
            style={{ ...secondaryButtonStyle, padding: "10px 16px" }}
          >
            Add another
          </button>
        </div>

        <World creations={creations} />
      </div>
    );
  }

  // "form" step now renders DrawingScreen directly — DrawingScreen owns
  // its own full-page layout/branding, so we don't wrap it in the
  // landing page's pageStyle/cardStyle (that would double up backgrounds).
  if (step === "form") {
    return <DrawingScreen onComplete={handleAddDrawing} />;
  }

  return (
    <div style={pageStyle}>
      <div style={backgroundLayerStyle} />
      <div style={cardStyle}>
        <span style={eyebrowStyle}>ScribblePark</span>

        <h1 style={{ margin: "8px 0 12px", fontSize: "36px", lineHeight: 1.1 }}>
          Add something to the park
        </h1>

        <p style={{ margin: "0 0 24px", color: "#5f6f5f", lineHeight: 1.6 }}>
          Start with a tiny idea and place it into the world.
        </p>

        <button type="button" onClick={() => setStep("form")} style={primaryButtonStyle}>
          Add something
        </button>
        <p style={{ marginTop: "14px", color: "#8b6d3f", fontSize: "13px", fontStyle: "italic" }}>
          A sketchbook park for little summer doodles.
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f7edc7",
  padding: "24px",
  position: "relative",
  overflow: "hidden",
  isolation: "isolate",
};

const backgroundLayerStyle = {
  position: "absolute",
  inset: 0,
  backgroundImage: [
    "radial-gradient(circle at 20% 20%, rgba(243, 230, 164, 0.44) 0 15%, transparent 16%)",
    "radial-gradient(circle at 80% 18%, rgba(170, 206, 132, 0.32) 0 18%, transparent 19%)",
    "linear-gradient(120deg, #f8efbf 0%, #e6e9c2 45%, #d8e4b4 100%)",
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 10px)",
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 10px)",
  ].join(", "),
  backgroundSize: "cover, cover, 180% 180%, 10px 10px, 10px 10px",
  backgroundPosition: "center, center, 0% 50%, 0 0, 0 0",
  animation: "meadowPulse 12s ease-in-out infinite",
  opacity: 1,
  pointerEvents: "none",
  zIndex: 0,
};

const cardStyle = {
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: "560px",
  background: "#fff9e8",
  border: "3px solid #4d6b3b",
  borderRadius: "18px",
  padding: "28px",
  boxShadow: "0 8px 20px rgba(33, 53, 35, 0.14)",
};

const eyebrowStyle = {
  display: "inline-block",
  margin: 0,
  padding: "4px 8px",
  borderRadius: "6px",
  background: "#f2d98b",
  color: "#456540",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontSize: "11px",
  border: "2px solid #4d6b3b",
};

const primaryButtonStyle = {
  border: "2px solid #4d6b3b",
  borderRadius: "8px",
  padding: "12px 18px",
  background: "#5d8f4a",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  border: "2px solid #4d6b3b",
  borderRadius: "8px",
  padding: "10px 16px",
  background: "#fffdf7",
  color: "#315638",
  fontWeight: 700,
  cursor: "pointer",
};

const floatingCardStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 20,
  background: "#fff9e8",
  border: "2px solid #4d6b3b",
  padding: "14px 16px",
  borderRadius: "10px",
  boxShadow: "0 6px 16px rgba(33, 53, 35, 0.12)",
  maxWidth: "300px",
};
