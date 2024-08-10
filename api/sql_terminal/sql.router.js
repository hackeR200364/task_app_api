const express = require("express");
const {
  createPlayground,
  createDatabase,
  getPlaygrounds,
  getPlayground,
  getProfile,
  execute,
  updatePlaygroundLastEdited,
  updatePlaygroundName,
  connectDatabase,
  updateDatabasePass,
} = require("./sql.controller");
const { checkToken } = require("../../auth/token_validation");
const router = express.Router();

router.post("/create/playground", createPlayground);
router.post("/create/database", createDatabase);
router.get("/playgrounds/:uid", getPlaygrounds);
router.get("/playground/:uid/:pid", getPlayground);
router.get("/profile/:uid", getProfile);
router.post("/execute", execute);
router.post("/update/playground/name", updatePlaygroundName);
router.post("/update/playground/lastEdited", updatePlaygroundLastEdited);
router.post("/update/database/password", updateDatabasePass);
router.post("/connect", connectDatabase);

module.exports = router;
