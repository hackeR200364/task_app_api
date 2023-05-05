const newsRouter = require("express").Router();
const { checkToken } = require("../../auth/token_validation");
const { createBloc } = require("./news.controller");

const multer = require("multer");
const path = require("path");
const express = require("express");

const storage = multer.diskStorage({
  destination: "./blocPics",
  ///home4/achiviec/public_html/blocProfile
  filename: (req, file, cb) => {
    const parsed = path.parse(file.originalname);
    const fileName = path.join(parsed.dir, parsed.name);

    console.log("uploading");

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

module.exports = newsRouter;

newsRouter.post("/createBloc", upload.single("blocProfile"), createBloc);
