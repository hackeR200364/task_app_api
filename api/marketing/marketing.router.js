const { addTopic, login } = require("./marketing.controller");
const express = require("express");
const { checkToken } = require("../../auth/token_validation");

const router = express.Router();

router.post("/topic/create", addTopic);
router.post("/admin/login", login);

module.exports = router;
