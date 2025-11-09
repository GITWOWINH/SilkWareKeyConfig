import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const KEYS = {}; // Store keys with timestamps
const KEY_EXPIRY_HOURS = 4;

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Key Generator Service is running" });
});

// Generate/add key (called by your website after checkpoints)
app.post("/add_key", (req, res) => {
  let key = req.body.key || uuidv4(); // generate unique key if not provided
  KEYS[key] = new Date();
  res.json({
    ok: true,
    key,
    expires_at: new Date(Date.now() + KEY_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
  });
});

// Check key (called by your C# app)
app.get("/check_key", (req, res) => {
  const key = req.query.key;
  if (key && KEYS[key]) {
    const issued = KEYS[key];
    if (new Date() - issued < KEY_EXPIRY_HOURS * 60 * 60 * 1000) {
      return res.json({ ok: true });
    } else {
      delete KEYS[key];
      return res.json({ ok: false, expired: true });
    }
  }
  res.json({ ok: false });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
