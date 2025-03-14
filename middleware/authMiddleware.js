const express = require("express");

// authMiddleware.js
const authMiddleware = (req, res, next) => {
  // Assuming you store user authentication info in the session(which was store in login)

  if (req.session && req.session.userId) {
    next(); // User is authenticated, allow access
  } else {
    res
      .status(400)
      .json({ Error: true, Message: "Unauthorized. Please log in." });
  }
};

module.exports = authMiddleware;
