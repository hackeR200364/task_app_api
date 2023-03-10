const {
  createUser,
  login,
  googleLogin,
  forgotPass,
} = require("./user.controller");
const { checkToken } = require("../../auth/token_validation");

const router = require("express").Router();

router.post("/create", createUser);
router.post("/login", login);
router.post("/googleLogin", googleLogin);
router.get("/forgotPass/:usrEmail", forgotPass);

module.exports = router;
