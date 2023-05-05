const {
  createUser,
  login,
  googleLogin,
  forgotPass,
  updateUserPassword,
  cancelResetPassToken,
  getUsrTaskRecords,
  getCompletionRate,
  verification,
  resendOTP,
} = require("./user.controller");
const { checkToken } = require("../../auth/token_validation");
const multer = require("multer");
const path = require("path");
const express = require("express");

const storage = multer.diskStorage({
  destination: "/home4/achiviec/public_html/profilePics",
  filename: (req, file, cb) => {
    const parsed = path.parse(file.originalname);
    const fileName = path.join(parsed.dir, parsed.name);

    return cb(
      null,
      `${fileName.split(" ").join("_")}_${Date.now()}${path.extname(
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
router.post("/verification/:uid/:verificationToken/:otp", verification);
router.get("/taskRecords/:uid", checkToken, getUsrTaskRecords);
router.get("/completionRate/:uid", checkToken, getCompletionRate);
router.post("/resendOTP/:uid/:verificationToken", resendOTP);

module.exports = router;
