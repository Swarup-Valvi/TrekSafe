import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import trekRoutes from "./routes/trek.js";

const app = express();

const PORT = 5050;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "TrekSafe API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trek", trekRoutes);

app.listen(PORT, () => {
  console.log(`TrekSafe server running on http://localhost:${PORT}`);
});