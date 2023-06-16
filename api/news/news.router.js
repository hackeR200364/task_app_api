const newsRouter = require("express").Router();
const { checkToken } = require("../../auth/token_validation");
const {
  createBloc,
  reportAllDetails,
  postReport,
  particularReportLike,
  particularReportComment,
  commentList,
} = require("./news.controller");

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

const newsPicsStorage = multer.diskStorage({
  destination: "./newsPics",
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

const newsPicsUpload = multer({ storage: newsPicsStorage });
const newsUpload = newsPicsUpload.fields([
  { name: "reportTumbImage" },
  { name: "reportImages", maxCount: 10 },
]);

module.exports = newsRouter;

newsRouter.post("/createBloc", upload.single("blocProfile"), createBloc);
newsRouter.post("/postNews", newsUpload, postReport);
newsRouter.get("/getReportDetails/:usrID/:reportUsrID", reportAllDetails);
newsRouter.post("/likeReport/:usrID/:reportID/:blocID", particularReportLike);
newsRouter.post("/commentReport", particularReportComment);
newsRouter.get("/comments/:reportID", commentList);
