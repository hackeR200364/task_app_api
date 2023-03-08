const { createUser, login, googleLogin } = require("./user.controller");
const { checkToken } = require("../../auth/token_validation");

const router = require("express").Router();

router.post("/create", createUser);
router.post("/login", checkToken, login);
router.post("/googleLogin", googleLogin);

module.exports = router;
