const express = require("express");
const router = express.Router();
const { googleLogin } = require("../controllers/auth/google");
const { googleRegister } = require("../controllers/auth/googleRegister");

router.post("/google", googleLogin);
router.post("/google/register", googleRegister);

module.exports = router;
