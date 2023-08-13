const {
  addTopic,
  login,
  getEmails,
  sendEmails,
  sendNotificationsByTopic,
  getDeviceTokens,
  getTopics,
} = require("./marketing.controller");
const express = require("express");
const { checkToken } = require("../../auth/token_validation");

const router = express.Router();

router.post("/admin/login", login);
router.get("/emails", getEmails);
router.post("/emails/send", sendEmails);
router.post("/notifications/send", sendNotificationsByTopic);
router.post("/notifications/topic/create", addTopic);
router.get("/notifications/tokens", getDeviceTokens);
router.get("/notifications/topics", getTopics);

module.exports = router;
