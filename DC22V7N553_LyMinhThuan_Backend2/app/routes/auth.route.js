const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/me", verifyToken, auth.getMe);
router.post("/facebook", auth.facebookLogin);
router.post("/google", auth.googleLogin);

module.exports = router;
