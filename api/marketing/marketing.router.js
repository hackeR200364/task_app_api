const {
  addTopic,
  login,
  getEmails,
  sendEmails,
} = require("./marketing.controller");
const express = require("express");
const { checkToken } = require("../../auth/token_validation");

const router = express.Router();

router.post("/topic/create", addTopic);
router.post("/admin/login", login);
router.post("/emails", getEmails);
router.post("/emails/send", sendEmails);

module.exports = router;
