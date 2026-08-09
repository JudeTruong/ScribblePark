import { useRef, useState, useEffect, useCallback } from "react";

// Internal drawing resolution — must stay 64x64 regardless of display size
const CANVAS_SIZE = 64;
// How large the canvas appears on screen (CSS only, doesn't affect resolution)
const DISPLAY_SIZE = 384;

const COLOR_PRESETS = [
  "#1a1a1a", // near-black
  "#ffffff", // white
  "#e63946", // red
  "#f4a261", // orange
  "#f9c74f", // yellow
  "#90be6d", // green
  "#4d96ff", // blue
  "#9b5de5", // purple
  "#ff6fb3", // pink
  "#8d5524", // brown
];

const BRUSH_SIZE = 2;

export default function DrawingCanvas({ onComplete }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const [tool, setTool] = useState("pencil"); // "pencil" | "eraser"
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isSubmittingRef = useRef(false);

  // Initialize canvas as fully transparent on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, []);

  // Convert a pointer event's screen coordinates into 64x64 canvas coordinates
  const getCanvasPoint = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const drawDot = useCallback((ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawLine = useCallback(
    (ctx, from, to) => {
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.ceil(dist / (BRUSH_SIZE / 3 || 1)));
      for (let i = 0; i <= steps; i++) {
        const x = from.x + ((to.x - from.x) * i) / steps;
        const y = from.y + ((to.y - from.y) * i) / steps;
        drawDot(ctx, x, y);
      }
    },
    [drawDot]
  );

  const applyToolSettings = useCallback(
    (ctx) => {
      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = color;
      }
    },
    [tool, color]
  );

  const handlePointerDown = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getCanvasPoint(clientX, clientY);

    applyToolSettings(ctx);
    drawDot(ctx, point.x, point.y);

    isDrawingRef.current = true;
    lastPointRef.current = point;
    setHasDrawn(true);
    setError("");
  };

  const handlePointerMove = (clientX, clientY) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getCanvasPoint(clientX, clientY);

    applyToolSettings(ctx);
    drawLine(ctx, lastPointRef.current, point);
    lastPointRef.current = point;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  // Mouse events
  const onMouseDown = (e) => handlePointerDown(e.clientX, e.clientY);
  const onMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
  const onMouseUp = () => handlePointerUp();
  const onMouseLeave = () => handlePointerUp();

  // Touch events
  const onTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerDown(touch.clientX, touch.clientY);
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  };
  const onTouchEnd = (e) => {
    e.preventDefault();
    handlePointerUp();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    setHasDrawn(false);
    setError("");
  };

  useEffect(() => {
    if (!isSubmitting) {
      setLoadingProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + Math.random() * 8 + 4, 95));
    }, 120);

    return () => clearInterval(interval);
  }, [isSubmitting]);

  const getTrimBounds = (canvas) => {
    const ctx = canvas.getContext("2d");
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let left = width;
    let right = 0;
    let top = height;
    let bottom = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha !== 0) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }

    if (bottom < top || right < left) {
      return null;
    }

    return {
      x: left,
      y: top,
      width: right - left + 1,
      height: bottom - top + 1,
    };
  };

  const getAlignedCanvas = (canvas) => {
    const bounds = getTrimBounds(canvas);
    if (!bounds) {
      return canvas;
    }

    const alignedCanvas = document.createElement("canvas");
    alignedCanvas.width = CANVAS_SIZE;
    alignedCanvas.height = CANVAS_SIZE;
    const ctx = alignedCanvas.getContext("2d");
    const destX = bounds.x;
    const destY = CANVAS_SIZE - bounds.height;

    ctx.drawImage(
      canvas,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      destX,
      destY,
      bounds.width,
      bounds.height
    );
    return alignedCanvas;
  };

  // Check whether any pixel has non-zero alpha (i.e. canvas isn't blank)
  const isCanvasEmpty = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { data } = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (isCanvasEmpty()) {
      setError("Draw something before planting it.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setError("");

    const canvas = canvasRef.current;
    const alignedCanvas = getAlignedCanvas(canvas);

    const imageBlob = await new Promise((resolve, reject) => {
      alignedCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Couldn't export your drawing. Try again."));
          return;
        }
        resolve(blob);
      }, "image/png");
    }).catch((err) => {
      setError(err.message);
      return null;
    });

    if (!imageBlob) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const previewUrl = URL.createObjectURL(imageBlob);
    const formData = new FormData();
    formData.append("image", imageBlob, "drawing.png");

    let category = "flower";
    try {
      const response = await fetch("http://127.0.0.1:8000/classify", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.results?.[0]?.label) {
          category = result.results[0].label;
        }
      } else {
        const errorBody = await response.text();
        console.warn("Classification failed:", response.status, errorBody);
      }
    } catch (fetchError) {
      console.warn("Classification request failed:", fetchError);
    }

    setLoadingProgress(100);
    onComplete({
      category,
      imageBlob,
      previewUrl,
    });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.canvasFrame}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={styles.canvas}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      </div>

      <div style={styles.toolRow}>
        <button
          type="button"
          onClick={() => setTool("pencil")}
          style={{ ...styles.toolButton, ...(tool === "pencil" ? styles.toolButtonActive : {}) }}
        >
          Pencil
        </button>
        <button
          type="button"
          onClick={() => setTool("eraser")}
          style={{ ...styles.toolButton, ...(tool === "eraser" ? styles.toolButtonActive : {}) }}
        >
          Eraser
        </button>
        <button type="button" onClick={handleClear} style={styles.toolButton}>
          Clear
        </button>
      </div>

      <div style={styles.paletteRow}>
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            aria-label={`Select color ${preset}`}
            onClick={() => {
              setColor(preset);
              setTool("pencil");
            }}
            style={{
              ...styles.swatch,
              backgroundColor: preset,
              ...(color === preset && tool === "pencil" ? styles.swatchActive : {}),
            }}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            setTool("pencil");
          }}
          style={styles.colorInput}
          aria-label="Custom color picker"
        />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!hasDrawn || isSubmitting}
        style={{ ...styles.plantButton, ...((!hasDrawn || isSubmitting) ? styles.plantButtonDisabled : {}) }}
      >
        {isSubmitting ? "Planting..." : "Plant in World"}
      </button>

      {isSubmitting && (
        <div style={styles.loadingBarBackground}>
          <div style={{ ...styles.loadingBarForeground, width: `${loadingProgress}%` }} />
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    fontFamily: "system-ui, sans-serif",
  },
  canvasFrame: {
    padding: "8px",
    borderRadius: "12px",
    background:
      "repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 16px 16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
  },
  canvas: {
    width: `${DISPLAY_SIZE}px`,
    height: `${DISPLAY_SIZE}px`,
    imageRendering: "pixelated",
    borderRadius: "6px",
    cursor: "crosshair",
    touchAction: "none",
    display: "block",
  },
  toolRow: { display: "flex", gap: "8px" },
  toolButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  toolButtonActive: {
    background: "#4d96ff",
    color: "#fff",
    borderColor: "#4d96ff",
  },
  paletteRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: `${DISPLAY_SIZE}px`,
  },
  swatch: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "2px solid #ddd",
    cursor: "pointer",
    padding: 0,
  },
  swatchActive: {
    border: "2px solid #1a1a1a",
    transform: "scale(1.15)",
  },
  colorInput: {
    width: "32px",
    height: "32px",
    padding: 0,
    border: "none",
    background: "none",
    cursor: "pointer",
  },
  label: { fontSize: "14px", color: "#555", marginRight: "4px" },
  nameRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: `${DISPLAY_SIZE}px`,
  },
  nameInput: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  error: { color: "#e63946", fontSize: "13px", margin: 0 },
  plantButton: {
    padding: "12px 28px",
    borderRadius: "999px",
    border: "none",
    background: "#4caf50",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  plantButtonDisabled: {
    background: "#a5d6a7",
    cursor: "not-allowed",
  },
  loadingBarBackground: {
    width: `${DISPLAY_SIZE}px`,
    height: "10px",
    borderRadius: "999px",
    background: "#e6e6e6",
    overflow: "hidden",
    marginTop: "12px",
  },
  loadingBarForeground: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #8bc34a, #4caf50)",
    transition: "width 120ms ease",
  },
};
