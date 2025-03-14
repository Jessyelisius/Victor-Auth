const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/home", authMiddleware, (req, res) => {
  res.send("Welcome to Dashboard");
});

module.exports = router;
