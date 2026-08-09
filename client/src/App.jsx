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
        }}
      >
        <div style={floatingCardStyle}>
          <h2
            style={{
              margin: "0 0 8px",
            }}
          >
            Your park is growing
          </h2>

          <p
            style={{
              margin: "0 0 12px",
            }}
          >
            {summary}
          </p>

          <button
            type="button"
            onClick={() =>
              setStep("form")
            }
            style={
              secondaryButtonStyle
            }
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
      <div style={cardStyle}>
        <p style={eyebrowStyle}>
          ScribblePark
        </p>

        <h1
          style={{
            margin: "8px 0 12px",
            fontSize: "36px",
          }}
        >
          Add something to the park
        </h1>

        <p
          style={{
            margin: "0 0 24px",
            color: "#5f6f5f",
          }}
        >
          Start with a tiny idea and place it into the world.
        </p>

        <button
          type="button"
          onClick={() =>
            setStep("form")
          }
          style={primaryButtonStyle}
        >
          Add something
        </button>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(135deg, #f8f4e8 0%, #e5f0d9 100%)",
  padding: "24px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "540px",
  background: "#fffdf8",
  borderRadius: "24px",
  padding: "28px",
  boxShadow:
    "0 16px 40px rgba(33, 53, 35, 0.16)",
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
  border:
    "1px solid #d4dfcf",
  borderRadius: "999px",
  padding: "12px 18px",
  background: "white",
  color: "#315638",
  fontWeight: 700,
  cursor: "pointer",
};

const floatingCardStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 20,
  background:
    "rgba(255, 253, 244, 0.95)",
  padding: "16px 18px",
  borderRadius: "16px",
  boxShadow:
    "0 10px 28px rgba(33, 53, 35, 0.16)",
  maxWidth: "300px",
};
