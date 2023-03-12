const {
  createUser,
  login,
  googleLogin,
  forgotPass,
  updateUserPassword,
  cancelResetPassToken,
} = require("./user.controller");
const { checkToken } = require("../../auth/token_validation");

const router = require("express").Router();

router.post("/create", createUser);
router.post("/login", login);
router.post("/googleLogin", googleLogin);
router.post("/forgotPass/:usrEmail", forgotPass);
router.post("/updateUserPassword", updateUserPassword);
router.post("/cancelResetPass/:resetToken/:uid", cancelResetPassToken);

module.exports = router;
