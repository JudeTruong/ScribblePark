import {
  useEffect,
  useMemo,
  useState,
} from "react";

import World from "./world/World";
import DrawingScreen from "./components/DrawingScreen";

import {
  createCreation,
  getCreations,
} from "./api/creations";

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

  // Fruit hangs from a tree.
  if (profile.zone === "tree") {
    const anchor =
      TREE_ANCHORS[
        Math.floor(
          Math.random() *
            TREE_ANCHORS.length
        )
      ];

    return {
      position: {
        x:
          anchor.x +
          Math.random() * 0.8 -
          0.4,

        y:
          anchor.y +
          Math.random() * 0.5,

        z:
          anchor.z +
          Math.random() * 0.3 -
          0.15,
      },

      scale,
    };
  }

  // Underwater animals go inside the pond.
  if (profile.zone === "pond") {
    return {
      position: {
        x: 6 + Math.random() * 4 - 2,
        y: 0.05,
        z: 2 + Math.random() * 2 - 1,
      },

      scale,
    };
  }

  // Ducks and other floating animals stay on the surface.
  if (profile.zone === "pondSurface") {
    return {
      position: {
        x: 6 + Math.random() * 4 - 2,
        y: 0.12,
        z: 2 + Math.random() * 2 - 1,
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

  // Land and flying creatures begin over land.
  // Flying animations raise them into the air.
  let x;
  let z;
  let insidePond;
  let outsideSafeArea;

  do {
    x = Math.random() * 30 - 15;
    z = Math.random() * 30 - 15;

    const pondX = (x - 6) / 4.8;
    const pondZ = (z - 2) / 3.7;

    insidePond =
      pondX ** 2 +
        pondZ ** 2 <
      1;

    outsideSafeArea =
      Math.hypot(x, z) > 17;
  } while (
    insidePond ||
    outsideSafeArea
  );

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
    getCreations()
      .then((savedCreations) => {
        setCreations(
          savedCreations.map(
            (creation) => {
              const classification =
                normalizeClassification(
                  creation.classification ||
                    creation.category ||
                    creation.type
                );

              return {
                ...creation,

                name:
                  displayCreationName(
                    creation.name ||
                      creation.creatorName
                  ),

                classification,
                category: classification,

                position: {
                  x:
                    creation.position?.x ??
                    0,

                  y:
                    creation.position?.y ??
                    0,

                  z:
                    creation.position?.z ??
                    0,
                },

                scale:
                  Number(
                    creation.scale
                  ) || 1,

                isPending: false,
              };
            }
          )
        );
      })
      .catch((error) => {
        console.error(
          "Failed to load creations:",
          error
        );
      })
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
    const normalizedClassification =
      normalizeClassification(
        classification ||
          type ||
          "unknown"
      );

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

        if (
          previewUrl?.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            previewUrl
          );
        }
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
        }}
      >
        <div
          style={
            floatingCardStyle
          }
        >
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
      <div style={cardStyle}>
        <p style={eyebrowStyle}>
          ScribblePark
        </p>

        <h1
          style={{
            margin:
              "8px 0 12px",

            fontSize: "36px",
          }}
        >
          Add something to the park
        </h1>

        <p
          style={{
            margin:
              "0 0 24px",

            color: "#5f6f5f",
          }}
        >
          Draw a creation and watch it come alive in the park.
        </p>

        <button
          type="button"
          onClick={() =>
            setStep("form")
          }
          style={
            primaryButtonStyle
          }
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