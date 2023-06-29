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
  blocTopReports,
  blocReports,
  likedReportsByUsr,
  particularBlocDetails,
  topReportsSearch,
  allReportsSearch,
  reportersSearch,
  topReports,
  recentReports,
  addNotifications,
  notifications,
  searchReportByCat,
  reportCategories,
  reportSearchAutocomplete,
  reporterSearchAutocomplete,
  hashtagsAutocomplete,
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
  { name: "reportImages", maxCount: 5 },
]);

module.exports = newsRouter;

//bloc creation
newsRouter.post(
  "/create",
  checkToken,
  upload.single("blocProfile"),
  createBloc
);

//add reports
newsRouter.post("/report/add", checkToken, newsUpload, postReport);

//all details of a particular report
newsRouter.get(
  "/report/details/:reportUsrID/:reportID/:usrID",
  checkToken,
  reportAllDetails
);

//get all reports
newsRouter.get("/reports/all/:usrID", checkToken, allReports);

//get all trending reports
newsRouter.get("/reports/trending/:usrID", checkToken, trendingReports);

//get all top reports
newsRouter.get("/reports/top/:usrID", checkToken, topReports);

//get all recents reports
newsRouter.get("/reports/recent/:usrID", checkToken, recentReports);

//get all top reports of a particular bloc
newsRouter.get("/reports/bloc/top/:blocID/:usrID", checkToken, blocTopReports);

//get all reports of a particular bloc
newsRouter.get("/reports/bloc/all/:blocID/:usrID", checkToken, blocReports);

//get all liked reports by a particular usr
newsRouter.get(
  "/reports/liked/usr/:likedByUsrID",
  checkToken,
  likedReportsByUsr
);

//get all top reports by searching
newsRouter.get("/reports/top/search/:usrID", checkToken, topReportsSearch);

//get all reports by searching
newsRouter.get("/reports/all/search/:usrID", checkToken, allReportsSearch);

//get all reports by searching by category
newsRouter.get(
  "/reports/category/search/:usrID",
  checkToken,
  searchReportByCat
);

//get all reporters by searching
newsRouter.get("/reporters/search/:fromUsrID", checkToken, reportersSearch);

//like a particular report
newsRouter.post(
  "/report/like/:usrID/:reportID/:blocID",
  checkToken,
  particularReportLike
);

//delete like a particular report
newsRouter.post(
  "/report/like/delete/:usrID/:reportID",
  checkToken,
  particularReportLikeDelete
);

//add comment to a particular report
newsRouter.post("/report/comment/add", checkToken, particularReportCommentPost);

//delete comment to a particular report
newsRouter.post(
  "/report/comment/delete/:commentID/:reportID",
  checkToken,
  particularReportCommentDelete
);

//get all comments of a particular reports
newsRouter.get("/comments/:reportID", checkToken, commentList);

//save a particular report
newsRouter.post("/report/save", checkToken, saveReport);

//unsave a particular report
newsRouter.post(
  "/report/unsave/:reportID/:fromUsrID",
  checkToken,
  unsaveReport
);

//follow a particular bloc
newsRouter.post("/follow", checkToken, followBloc);

//unfollow a particular bloc
newsRouter.post("/unfollow/:blocID/:fromUsrID", checkToken, unfollowBloc);

//get all details of a particular bloc
newsRouter.get(
  "/bloc/details/:blocID/:usrID/:fromUsrID",
  checkToken,
  particularBlocDetails
);

//add new notification
newsRouter.post("/notification/add", checkToken, addNotifications);

//get all notifications
newsRouter.get("/notifications/:usrID", checkToken, notifications);

//get all report categories
newsRouter.get("/categories", checkToken, reportCategories);

//report searching autocomplete
newsRouter.get(
  "/reports/search/autocomplete",
  checkToken,
  reportSearchAutocomplete
);

//reporters searching autocomplete
newsRouter.get(
  "/reporters/autocomplete",
  checkToken,
  reporterSearchAutocomplete
);

//hashtags autocomplete
newsRouter.get("/hashtags/autocomplete", checkToken, hashtagsAutocomplete);
