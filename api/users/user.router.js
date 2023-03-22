const {
  createUser,
  login,
  googleLogin,
  forgotPass,
  updateUserPassword,
  cancelResetPassToken,
  getUsrTaskRecords,
} = require("./user.controller");
const { checkToken } = require("../../auth/token_validation");
const multer = require("multer");
const path = require("path");
const express = require("express");

const storage = multer.diskStorage({
  destination: "./profilePics",
  filename: (req, file, cb) => {
    const parsed = path.parse(file.originalname);

    return cb(
      null,
      `${path.join(parsed.dir, parsed.name)}_${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({
  storage: storage,
});

const router = express.Router();


router.post("/create", upload.single("usrProfilePic"), createUser);
router.post("/login", login);
router.post("/googleLogin", googleLogin);
router.post("/forgotPass/:usrEmail", forgotPass);
router.post("/updateUserPassword", updateUserPassword);
router.post("/cancelResetPass/:resetToken/:uid", cancelResetPassToken);
router.get("/taskRecords", checkToken, getUsrTaskRecords);

module.exports = router;
