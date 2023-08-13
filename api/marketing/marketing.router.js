const {
  addTopic,
  login,
  getEmailsMarketing,
  sendNotificationsByTopic,
  getDeviceTokens,
  getTopics,
  sendNotificationsByToken,
  sendNotificationsByTokenList,
  sendEmailsMarketing,
  sendEmailsUsers,
  getEmailsOfUsers,
} = require("./marketing.controller");
const express = require("express");
const { checkToken } = require("../../auth/token_validation");

const router = express.Router();

router.post("/admin/login", login);
router.get("/emails/marketing", getEmailsMarketing);
router.get("/emails/users", getEmailsOfUsers);
router.post("/emails/marketing/send", sendEmailsMarketing);
router.post("/emails/users/send", sendEmailsUsers);
router.post("/notifications/topic/send", sendNotificationsByTopic);
router.post("/notifications/topic/create", addTopic);
router.get("/notifications/tokens", getDeviceTokens);
router.get("/notifications/topics", getTopics);
router.post("/notifications/token/send", sendNotificationsByToken);
router.post("/notifications/token/list/send", sendNotificationsByTokenList);

module.exports = router;
