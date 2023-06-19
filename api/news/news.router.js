const newsRouter = require("express").Router();
const { checkToken } = require("../../auth/token_validation");
const {
  createBloc,
  reportAllDetails,
  postReport,
  particularReportLike,
  commentList,
  particularReportCommentPost,
  particularReportCommentDelete,
  allReports,
  particularReportLikeDelete,
  saveReport,
  unsaveReport,
  followBloc,
  unfollowBloc,
  trendingReports,
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
newsRouter.post("/reportCommentPost", particularReportCommentPost);
newsRouter.post(
  "/reportCommentDelete/:commentID/:reportID",
  particularReportCommentDelete
);
newsRouter.get("/comments/:reportID", commentList);
newsRouter.get("/allReports/:usrID", allReports);
newsRouter.post(
  "/reportLikeDelete/:usrID/:reportID",
  particularReportLikeDelete
);
newsRouter.post("/saveReport", saveReport);
newsRouter.post("/unsaveReport/:reportID/:fromUsrID", unsaveReport);
newsRouter.post("/follow", followBloc);
newsRouter.post("/unfollow/:blocID/:fromUsrID", unfollowBloc);
newsRouter.get("/trendingReports/:usrID", trendingReports);
