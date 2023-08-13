const {
  addTopic,
  login,
  getEmails,
  sendEmails,
  sendNotificationsByTopic,
  getDeviceTokens,
} = require("./marketing.controller");
const express = require("express");
const { checkToken } = require("../../auth/token_validation");

const router = express.Router();

router.post("/admin/login", login);
router.post("/emails", getEmails);
router.post("/emails/send", sendEmails);
router.post("/notifications/send", sendNotificationsByTopic);
router.post("/notifications/topic/create", addTopic);
router.post("/notifications/tokens", getDeviceTokens);

module.exports = router;
