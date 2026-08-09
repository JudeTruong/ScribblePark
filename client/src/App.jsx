import { useEffect, useMemo, useState } from "react";
import World from "./world/World";
import DrawingScreen from "./components/DrawingScreen";
import { createCreation, getCreations } from "./api/creations";
import {
  resolveCategory,
  resolveSpecies,
} from "./utils/classificationMap";
import {
  LANDFILL_CENTRE,
  LANDFILL_RADIUS,
  isInsideLandfill,
} from "./utils/landfill";
import { isInsideWalkingHill } from "./world/worldLayout";

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

  landfill: {
    minScale: 0.5,
    maxScale: 0.8,
    zone: "landfill",
  },
};

import {
  getCreationProfile,
  normalizeClassification,
  randomProfileScale,
  TREE_ANCHORS,
} from "./world/creationProfiles";

function randomPlacement(classification) {
  const profile =
    getCreationProfile(classification);

  const scale =
    randomProfileScale(classification);

  // Fruit has fallen from the tree: it rests on the ground in the
  // ring between the trunk and the edge of the canopy, so it reads as
  // dropped from any camera angle rather than floating beside a branch.
  if (profile.zone === "tree") {
    const anchor =
      TREE_ANCHORS[
        Math.floor(
          Math.random() *
            TREE_ANCHORS.length
        )
      ];

    const treeScale = anchor.scale ?? 1;

    // Trunk is r=0.22 at its base; the canopy reaches out to r=0.72.
    const trunkEdge = 0.22 * treeScale;
    const dripLine = 0.72 * treeScale;

    const angle = Math.random() * Math.PI * 2;

    // Clear the trunk by the fruit's own radius (half its scale) so it
    // never clips into the bark, then scatter out to the drip line.
    const fruitRadius = scale * 0.5;

    const inner = trunkEdge + fruitRadius + 0.06;
    const outer = Math.max(dripLine, inner + 0.35);

    const distance =
      inner + Math.random() * (outer - inner);

    return {
      position: {
        x: anchor.x + Math.cos(angle) * distance,
        y: 0,
        z: anchor.z + Math.sin(angle) * distance,
      },

      scale,
    };
  }


  // Underwater animals go inside the pond.
  if (profile.zone === "pond") {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random());

    return {
      position: {
        x: 6 + Math.cos(angle) * distance * 2.35,
        y: 0.05,
        z: 2 + Math.sin(angle) * distance * 1.35,
      },

      scale,
    };
  }

  // Ducks and other floating animals stay on the surface.
  if (profile.zone === "pondSurface") {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random());

    return {
      position: {
        x: 6 + Math.cos(angle) * distance * 2.2,
        y: 0.12,
        z: 2 + Math.sin(angle) * distance * 1.25,
      },

      scale,
    };
  }

  // Toads and similar animals stay around the pond edge.
  if (profile.zone === "pondEdge") {
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

  // Litter collects in the dump in the
  // back-left corner.
  if (profile.classification === "landfill") {
    const angle =
      Math.random() * Math.PI * 2;

    // Square root keeps the scatter even
    // across the circle instead of
    // clumping in the middle.
    const distance =
      Math.sqrt(Math.random()) *
      (LANDFILL_RADIUS - 0.45);

    return {
      position: {
        x:
          LANDFILL_CENTRE.x +
          Math.cos(angle) * distance,
        y: 0,
        z:
          LANDFILL_CENTRE.z +
          Math.sin(angle) * distance,
      },
      scale,
    };
  }

  // Everything else appears on land.
  let x;
  let z;
  let blocked;

  do {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * 38;

    x = Math.cos(angle) * distance;
    z = Math.sin(angle) * distance;

    const pondX = (x - 6) / 4.8;
    const pondZ = (z - 2) / 3.7;

    const insidePond =
      pondX ** 2 + pondZ ** 2 < 1;

    blocked =
      insidePond ||
      isInsideLandfill(x, z) ||
      isInsideWalkingHill(x, z);
  } while (blocked);

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

  return (
    name &&
    name !== "Unnamed Creation"
      ? name
      : "Unnamed"
  );
}

export default function App() {
  const [step, setStep] =
    useState("landing");

  const [
    creations,
    setCreations,
  ] = useState([]);

  const [
    loadingCreations,
    setLoadingCreations,
  ] = useState(true);

  useEffect(() => {
    const id = "scribblepark-font-fredoka";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    getCreations()
      .then((savedCreations) => {
        const mapped = savedCreations.map((creation) => ({
          ...creation,
          name:
            displayCreationName(
              creation.name ||
                creation.creatorName
            ),
        }));
        setCreations(mapped);
      })
      .catch(console.error)
      .finally(() => {
        setLoadingCreations(false);
      });
  }, []);

  function handleAddDrawing({
    previewUrl,
    imageBlob,
    creatorName,
    name,
    type,
    classification,
    confidence,
    predictions = [],
  }) {
    // Raw model label (e.g. "whale") -> park category (e.g. "fish"),
    // using top-k predictions as a fallback when the top label maps to
    // landfill. Then normalizeClassification applies local aliases.
    const normalizedClassification =
      normalizeClassification(
        resolveCategory(type, predictions)
      );

    // The label that actually decided the category -- shown on the card
    // so a drawing the model knows as "cat" is not just called "Mammal".
    const species =
      resolveSpecies(type, predictions);

    const placement =
      randomPlacement(
        normalizedClassification
      );

    const displayName =
      displayCreationName(
        creatorName || name
      );

    const temporaryId =
      `temporary-${Date.now()}`;

    const temporaryCreation = {
      id: temporaryId,

      name: displayName,

      creatorName:
        displayName === "Unnamed"
          ? ""
          : displayName,

      description:
        `Hand-drawn ${normalizedClassification}`,

      classification:
        normalizedClassification,

      category:
        normalizedClassification,

      type:
        species ||
        type ||
        normalizedClassification,

      confidence,
      predictions,

      imageUrl: previewUrl,

      position:
        placement.position,

      scale:
        placement.scale,

      isPending: true,
    };

    // Display immediately.
    setCreations((current) => [
      ...current,
      temporaryCreation,
    ]);

    setStep("world");

    // Save in the background.
    createCreation({
      classification:
        normalizedClassification,

      category:
        normalizedClassification,

      creatorName:
        displayName === "Unnamed"
          ? ""
          : displayName,

      name:
        displayName === "Unnamed"
          ? ""
          : displayName,

      imageBlob,

      position:
        placement.position,

      scale:
        placement.scale,
    })
      .then((savedCreation) => {
        setCreations((current) =>
          current.map((creation) => {
            if (
              creation.id !==
              temporaryId
            ) {
              return creation;
            }

            const savedClassification =
              normalizeClassification(
                savedCreation.classification ||
                  savedCreation.category ||
                  normalizedClassification
              );

            return {
              ...temporaryCreation,
              ...savedCreation,

              name:
                displayCreationName(
                  savedCreation.name ||
                    savedCreation.creatorName ||
                    displayName
                ),

              classification:
                savedClassification,

              category:
                savedClassification,

              description:
                `Hand-drawn ${savedClassification}`,

              type:
                type ||
                savedClassification,

              confidence,
              predictions,

              position:
                savedCreation.position ||
                placement.position,

              scale:
                Number(
                  savedCreation.scale
                ) ||
                placement.scale,

              isPending: false,
            };
          })
        );
      })
      .catch((error) => {
        console.error(
          "Failed to save creation:",
          error
        );

        // Keep it visible for the session.
        setCreations((current) =>
          current.map((creation) =>
            creation.id ===
            temporaryId
              ? {
                  ...creation,
                  isPending: false,
                  saveError: true,
                }
              : creation
          )
        );
      });
  }

  const summary = useMemo(() => {
    if (loadingCreations) {
      return "Loading creations...";
    }

    if (
      creations.length === 0
    ) {
      return "No creations yet";
    }

    return `${
      creations.length
    } creation${
      creations.length > 1
        ? "s"
        : ""
    } in the world`;
  }, [
    creations,
    loadingCreations,
  ]);

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
          <h2 style={{ margin: "0 0 6px", fontSize: "18px" }}>The park is growing</h2>

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

        <World
          creations={creations}
        />
      </div>
    );
  }

  if (step === "form") {
    return (
      <DrawingScreen
        onComplete={
          handleAddDrawing
        }
        onBack={() =>
          setStep("landing")
        }
      />
    );
  }

  return (
    <div style={pageStyle}>
      <div style={backgroundLayerStyle} />
      <div style={cardStyle}>
        <h1 style={heroTitleStyle}>ScribblePark</h1>
        <p style={heroDescriptionStyle}>
          Draw a little doodle, plant it in the park, and watch the meadow grow.
        </p>

        <button type="button" onClick={() => setStep("form")} style={primaryButtonStyle}>
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
  background: "#f7edc7",
  padding: "24px",
  position: "relative",
  overflow: "hidden",
  isolation: "isolate",
  fontFamily: "'Fredoka', system-ui, sans-serif",
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
  fontFamily: "'Fredoka', system-ui, sans-serif",
};

const heroTitleStyle = {
  margin: "0 0 12px",
  fontSize: "clamp(40px, 7vw, 64px)",
  lineHeight: 1.05,
  color: "#2f472f",
  fontWeight: 700,
  letterSpacing: "0.02em",
  fontFamily: "'Fredoka', system-ui, sans-serif",
};

const heroDescriptionStyle = {
  margin: "0 0 20px",
  color: "#5f6f5f",
  fontSize: "16px",
  lineHeight: 1.6,
  maxWidth: "420px",
  fontFamily: "'Fredoka', system-ui, sans-serif",
};

const primaryButtonStyle = {
  border: "2px solid #4d6b3b",
  borderRadius: "8px",
  padding: "12px 18px",
  background: "#5d8f4a",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Fredoka', system-ui, sans-serif",
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
