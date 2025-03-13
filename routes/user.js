const {
  Registration,
  Login,
  ForgotPassword,
  ResetPassword,
} = require("../controller/userContrl");

const router = require("express").Router();

router.get("/register", async (req, res) => {
  res.render("signup");
});

router.post("/register", Registration);

router.get("/login", async (req, res) => {
  res.render("login");
});

router.post("/login", Login);

router.post("/forgetPwd", ForgotPassword);
router.post("/resetPwd", ResetPassword);

module.exports = router;
