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
router.get("/emails/marketing",checkToken, getEmailsMarketing);
router.get("/emails/users", checkToken, getEmailsOfUsers);
router.post("/emails/marketing/send", checkToken, sendEmailsMarketing);
router.post("/emails/users/send", checkToken, sendEmailsUsers);
router.post("/notifications/topic/send", checkToken, sendNotificationsByTopic);
router.post("/notifications/topic/create", checkToken, addTopic);
router.get("/notifications/tokens", checkToken, getDeviceTokens);
router.get("/notifications/topics", checkToken, getTopics);
router.post("/notifications/token/send", checkToken, sendNotificationsByToken);
router.post(
  "/notifications/token/list/send",
  checkToken,
  sendNotificationsByTokenList
);

module.exports = router;
