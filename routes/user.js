const { Registration, Login } = require("../controller/userContrl");

const router = require("express").Router();

router.get("/register", async (req, res) => {
  res.render("signup");
});

router.post("/register", Registration);

router.get("/login", async (req, res) => {
  res.render("login");
});

router.post("/login", Login);

module.exports = router;
