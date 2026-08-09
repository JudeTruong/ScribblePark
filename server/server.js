import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import mysql from "mysql2/promise";

const PORT = process.env.PORT || 3001;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "image/png") {
      cb(new Error("Only PNG images are allowed"));
      return;
    }
    cb(null, true);
  },
});

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
app.set("trust proxy", true);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

function rowToCreation(req, row) {
  return {
    id: row.id,
    classification: row.classification,
    creatorName: row.creator_name,
    imageUrl: `${req.protocol}://${req.get("host")}/api/creations/${row.id}/image`,
    position: {
      x: row.position_x,
      y: row.position_y,
      z: row.position_z,
    },
    scale: row.scale,
    createdAt: row.created_at,
    isPending: false,
  };
}

app.post("/api/creations", (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    const { classification, creatorName, positionX, positionY, positionZ, scale } = req.body;

    if (!req.file) {
      res.status(400).json({ error: "An image file is required" });
      return;
    }
    if (creatorName !== undefined && (typeof creatorName !== "string" || creatorName.length > 50)) {
      res.status(400).json({ error: "creatorName must be 50 characters or fewer" });
      return;
    }
    if (classification !== undefined && (typeof classification !== "string" || classification.length > 50)) {
      res.status(400).json({ error: "classification must be 50 characters or fewer" });
      return;
    }
    const posX = Number(positionX);
    const posY = positionY === undefined ? 0 : Number(positionY);
    const posZ = Number(positionZ);
    const flowerScale = scale === undefined ? 1 : Number(scale);
    if (!Number.isFinite(posX) || !Number.isFinite(posY) || !Number.isFinite(posZ) || !Number.isFinite(flowerScale)) {
      res.status(400).json({ error: "position and scale must be numeric" });
      return;
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO creations (classification, creator_name, image, mime_type, position_x, position_y, position_z, scale)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          classification || "flower",
          creatorName ? creatorName.trim() : null,
          req.file.buffer,
          req.file.mimetype,
          posX,
          posY,
          posZ,
          flowerScale,
        ]
      );

      const [rows] = await pool.query("SELECT * FROM creations WHERE id = ?", [result.insertId]);
      res.status(201).json(rowToCreation(req, rows[0]));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save creation" });
    }
  });
});

app.get("/api/creations", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, classification, creator_name, position_x, position_y, position_z, scale, created_at FROM creations ORDER BY id"
    );
    res.json(rows.map((row) => rowToCreation(req, row)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load creations" });
  }
});

app.get("/api/creations/:id/image", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT image, mime_type FROM creations WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      res.status(404).json({ error: "Creation not found" });
      return;
    }
    res.set("Content-Type", rows[0].mime_type);
    res.send(rows[0].image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load image" });
  }
});

app.listen(PORT, () => {
  console.log(`ScribblePark server listening on http://localhost:${PORT}`);
});