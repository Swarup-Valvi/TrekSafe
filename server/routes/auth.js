import express from "express";
import users from "../users.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (user) =>
      user.username === username &&
      user.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name
    }
  });
});

export default router;