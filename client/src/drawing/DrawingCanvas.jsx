import { useRef, useState, useEffect, useCallback } from "react";

const CLASSIFIER_URL = import.meta.env.VITE_CLASSIFIER_URL || "http://localhost:8000";

// Internal drawing resolution — must stay 64x64 regardless of display size
const CANVAS_SIZE = 64;
// How large the canvas appears on screen (CSS only, doesn't affect resolution)
const DISPLAY_SIZE = 384;

const COLOR_PRESETS = [
  "#1a1a1a", // near-black
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
  const lineCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const [tool, setTool] = useState("pencil"); // "pencil" | "eraser" | "fill"
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [creatorName, setCreatorName] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isSubmittingRef = useRef(false);

  // Load the shared page font (no-op if DrawingScreen already loaded it)
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

  // Initialize canvas as fully transparent on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const lineCanvas = document.createElement("canvas");
    lineCanvas.width = CANVAS_SIZE;
    lineCanvas.height = CANVAS_SIZE;
    lineCanvasRef.current = lineCanvas;
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
    [color, tool]
  );

  const hexToRgb = (hex) => {
    const normalized = hex.replace("#", "");
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  };

  const isBlackLinePixel = (data, index) => {
    return (
      data[index + 3] > 8 &&
      data[index] < 60 &&
      data[index + 1] < 60 &&
      data[index + 2] < 60
    );
  };

  const sameFillRegion = (data, index, target) => {
    if (isBlackLinePixel(data, index)) {
      return false;
    }

    return (
      Math.abs(data[index] - target.r) <= 8 &&
      Math.abs(data[index + 1] - target.g) <= 8 &&
      Math.abs(data[index + 2] - target.b) <= 8 &&
      Math.abs(data[index + 3] - target.a) <= 8
    );
  };

  const floodFill = useCallback(
    (x, y) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      const { data } = imageData;
      const startX = Math.floor(x);
      const startY = Math.floor(y);

      if (startX < 0 || startX >= CANVAS_SIZE || startY < 0 || startY >= CANVAS_SIZE) {
        return;
      }

      const startIndex = (startY * CANVAS_SIZE + startX) * 4;
      if (isBlackLinePixel(data, startIndex)) {
        return;
      }

      const target = {
        r: data[startIndex],
        g: data[startIndex + 1],
        b: data[startIndex + 2],
        a: data[startIndex + 3],
      };
      const fillColor = hexToRgb(color);

      if (
        target.a === 255 &&
        Math.abs(target.r - fillColor.r) <= 8 &&
        Math.abs(target.g - fillColor.g) <= 8 &&
        Math.abs(target.b - fillColor.b) <= 8
      ) {
        return;
      }

      const stack = [[startX, startY]];
      const visited = new Uint8Array(CANVAS_SIZE * CANVAS_SIZE);

      while (stack.length > 0) {
        const [currentX, currentY] = stack.pop();

        if (
          currentX < 0 ||
          currentX >= CANVAS_SIZE ||
          currentY < 0 ||
          currentY >= CANVAS_SIZE
        ) {
          continue;
        }

        const pixelIndex = currentY * CANVAS_SIZE + currentX;
        if (visited[pixelIndex]) {
          continue;
        }
        visited[pixelIndex] = 1;

        const dataIndex = pixelIndex * 4;
        if (!sameFillRegion(data, dataIndex, target)) {
          continue;
        }

        data[dataIndex] = fillColor.r;
        data[dataIndex + 1] = fillColor.g;
        data[dataIndex + 2] = fillColor.b;
        data[dataIndex + 3] = 255;

        stack.push([currentX + 1, currentY]);
        stack.push([currentX - 1, currentY]);
        stack.push([currentX, currentY + 1]);
        stack.push([currentX, currentY - 1]);
      }

      ctx.putImageData(imageData, 0, 0);
      setHasDrawn(true);
      setError("");
    },
    [color]
  );

  const handlePointerDown = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getCanvasPoint(clientX, clientY);

    if (tool === "fill") {
      floodFill(point.x, point.y);
      return;
    }

    applyToolSettings(ctx);
    drawDot(ctx, point.x, point.y);

    const lineCtx = lineCanvasRef.current?.getContext("2d");
    if (lineCtx) {
      applyToolSettings(lineCtx);
      drawDot(lineCtx, point.x, point.y);
    }

    isDrawingRef.current = true;
    lastPointRef.current = point;
    setHasDrawn(true);
    setError("");
  };

  const handlePointerMove = (clientX, clientY) => {
    if (!isDrawingRef.current || tool === "fill") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getCanvasPoint(clientX, clientY);

    applyToolSettings(ctx);
    drawLine(ctx, lastPointRef.current, point);

    const lineCtx = lineCanvasRef.current?.getContext("2d");
    if (lineCtx) {
      applyToolSettings(lineCtx);
      drawLine(lineCtx, lastPointRef.current, point);
    }

    lastPointRef.current = point;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const onMouseDown = (e) => handlePointerDown(e.clientX, e.clientY);
  const onMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
  const onMouseUp = () => handlePointerUp();
  const onMouseLeave = () => handlePointerUp();

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
    const lineCtx = lineCanvasRef.current?.getContext("2d");
    lineCtx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
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

  const getLineArtCanvas = (canvas) => {
    const classifierCanvas = document.createElement("canvas");
    classifierCanvas.width = CANVAS_SIZE;
    classifierCanvas.height = CANVAS_SIZE;
    const ctx = classifierCanvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(canvas, 0, 0);

    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const { data } = imageData;

    for (let index = 0; index < data.length; index += 4) {
      const value = isBlackLinePixel(data, index) ? 0 : 255;

      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return classifierCanvas;
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

  const isLineCanvasEmpty = () => {
    const canvas = lineCanvasRef.current;
    if (!canvas) {
      return true;
    }

    const ctx = canvas.getContext("2d");
    const { data } = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let index = 0; index < data.length; index += 4) {
      if (isBlackLinePixel(data, index)) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (isCanvasEmpty()) {
      setError("Draw something before planting it.");
      return;
    }
    if (isLineCanvasEmpty()) {
      setError("Draw black lines before planting it.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setError("");

    const canvas = canvasRef.current;
    const lineCanvas = lineCanvasRef.current;
    const alignedCanvas = getAlignedCanvas(canvas);

    const originalBlob = await new Promise((resolve, reject) => {
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

    if (!originalBlob) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const previewUrl = URL.createObjectURL(originalBlob);

    const alignedLineCanvas = getAlignedCanvas(lineCanvas || canvas);
    const classifierCanvas = getLineArtCanvas(alignedLineCanvas);

    const classifierBlob = await new Promise((resolve, reject) => {
      classifierCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Couldn't export classifier image."));
          return;
        }
        resolve(blob);
      }, "image/png");
    }).catch((err) => {
      setError(err.message);
      return null;
    });

    if (!classifierBlob) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", classifierBlob, "drawing-white.png");

    let type = null;
    let confidence = null;
    let predictions = [];
    let responseOk = false;

    try {
      const response = await fetch(`${CLASSIFIER_URL}/api/classify`, {
        method: "POST",
        body: formData,
      });

      responseOk = response.ok;
      const result = await response.json();

      predictions = result?.predictions ?? [];
      type = result?.type ?? predictions?.[0]?.label ?? null;
      confidence = result?.confidence ?? predictions?.[0]?.score ?? null;
    } catch (fetchError) {
      console.warn("[DrawingCanvas] Classification request failed:", fetchError);
      setError("Could not classify drawing. Please try again.");
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    if (!responseOk) {
      setError("Classifier rejected the request. Check backend and try again.");
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    setLoadingProgress(100);
    onComplete({
      imageBlob: originalBlob,
      previewUrl,
      creatorName: creatorName.trim(),
      type,
      confidence,
      predictions,
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
        <button
          type="button"
          onClick={() => setTool("fill")}
          style={{ ...styles.toolButton, ...(tool === "fill" ? styles.toolButtonActive : {}) }}
        >
          Fill
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
            title={preset}
            onClick={() => {
              setColor(preset);
            }}
            style={{
              ...styles.swatch,
              backgroundColor: preset,
              ...(color === preset && tool === "fill" ? styles.swatchActive : {}),
            }}
          />
        ))}

        <label style={styles.customColorLabel} title="Pick a custom color">
          <span style={styles.customColorSwatch}>🎨</span>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
            }}
            style={styles.colorInput}
            aria-label="Custom color picker"
          />
        </label>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.plantRow}>
        <input
          type="text"
          value={creatorName}
          onChange={(event) => setCreatorName(event.target.value)}
          maxLength={50}
          placeholder="Name it (optional)"
          style={styles.nameInput}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasDrawn || isSubmitting}
          style={{ ...styles.plantButton, ...((!hasDrawn || isSubmitting) ? styles.plantButtonDisabled : {}) }}
        >
          {isSubmitting ? "Planting..." : "Plant in World"}
        </button>
      </div>

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
    fontFamily: "'Fredoka', system-ui, sans-serif",
  },
  canvasFrame: {
    padding: "10px",
    borderRadius: "12px",
    background: "#fff9e8",
    border: "3px solid #4d6b3b",
    boxShadow: "0 6px 16px rgba(41, 58, 36, 0.12)",
  },
  canvas: {
    width: `${DISPLAY_SIZE}px`,
    height: `${DISPLAY_SIZE}px`,
    imageRendering: "pixelated",
    borderRadius: "10px",
    border: "3px solid #3a4a2e",
    cursor: "crosshair",
    touchAction: "none",
    display: "block",
    boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.8)",
  },
  toolRow: { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" },
  toolButton: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "2px solid #4d6b3b",
    background: "#fffdf7",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "'Fredoka', system-ui, sans-serif",
    fontWeight: 500,
    color: "#315638",
  },
  toolButtonActive: {
    background: "#5d8f4a",
    color: "#fff",
    borderColor: "#4d6b3b",
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
    border: "2px solid #e7d4a1",
    cursor: "pointer",
    padding: 0,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  swatchActive: {
    border: "2px solid #1a1a1a",
    transform: "scale(1.12)",
  },
  customColorLabel: {
    position: "relative",
    display: "inline-flex",
    cursor: "pointer",
  },
  customColorSwatch: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "2px dashed #a9a9a9",
    background: "#fdfdfd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },
  colorInput: {
    position: "absolute",
    inset: 0,
    width: "30px",
    height: "30px",
    opacity: 0,
    padding: 0,
    border: "none",
    cursor: "pointer",
  },
  plantRow: {
    display: "flex",
    gap: "10px",
    width: `${DISPLAY_SIZE}px`,
    maxWidth: "100%",
    justifyContent: "center",
    alignItems: "stretch",
    flexWrap: "wrap",
  },
  nameInput: {
    flex: "1 1 170px",
    minWidth: 0,
    padding: "10px 12px",
    borderRadius: "8px",
    border: "2px solid #4d6b3b",
    fontSize: "14px",
    fontFamily: "'Fredoka', system-ui, sans-serif",
    background: "#fffdf7",
  },
  error: { color: "#e63946", fontSize: "13px", margin: 0 },
  plantButton: {
    padding: "12px 28px",
    borderRadius: "8px",
    border: "2px solid #4d6b3b",
    background: "#5d8f4a",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    fontFamily: "'Fredoka', system-ui, sans-serif",
    cursor: "pointer",
    flex: "0 0 auto",
  },
  plantButtonDisabled: {
    background: "#a5d6a7",
    cursor: "not-allowed",
  },
  loadingBarBackground: {
    width: `${DISPLAY_SIZE}px`,
    height: "10px",
    borderRadius: "999px",
    background: "#ebdeae",
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
