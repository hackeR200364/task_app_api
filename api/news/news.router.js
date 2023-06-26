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
newsRouter.post("/create", upload.single("blocProfile"), createBloc);

//add reports
newsRouter.post("/report/add", newsUpload, postReport);

//all details of a particular report
newsRouter.get(
  "/report/details/:reportUsrID/:reportID/:usrID",
  reportAllDetails
);

//get all reports
newsRouter.get("/reports/all/:usrID", allReports);

//get all trending reports
newsRouter.get("/reports/trending/:usrID", trendingReports);

//get all top reports
newsRouter.get("/reports/top/:usrID", topReports);

//get all recents reports
newsRouter.get("/reports/recents", recentReports);

//get all top reports of a particular bloc
newsRouter.get("/reports/bloc/top/:blocID/:usrID", blocTopReports);

//get all reports of a particular bloc
newsRouter.get("/reports/bloc/all/:blocID/:usrID", blocReports);

//get all liked reports by a particular usr
newsRouter.get("/reports/liked/usr/:likedByUsrID", likedReportsByUsr);

//get all top reports by searching
newsRouter.get("/reports/top/search/:usrID", topReportsSearch);

//get all reports by searching
newsRouter.get("/reports/all/search/:usrID", allReportsSearch);

//get all reports by searching by category
newsRouter.get("/reports/category/search/:usrID", searchReportByCat);

//get all reporters by searching
newsRouter.get("/reporters/search/:fromUsrID", reportersSearch);

//like a particular report
newsRouter.post("/report/like/:usrID/:reportID/:blocID", particularReportLike);

//delete like a particular report
newsRouter.post(
  "/report/like/delete/:usrID/:reportID",
  particularReportLikeDelete
);

//add comment to a particular report
newsRouter.post("/report/comment/add", particularReportCommentPost);

//delete comment to a particular report
newsRouter.post(
  "/report/comment/delete/:commentID/:reportID",
  particularReportCommentDelete
);

//get all comments of a particular reports
newsRouter.get("/comments/:reportID", commentList);

//save a particular report
newsRouter.post("/report/save", saveReport);

//unsave a particular report
newsRouter.post("/report/unsave/:reportID/:fromUsrID", unsaveReport);

//follow a particular bloc
newsRouter.post("/follow", followBloc);

//unfollow a particular bloc
newsRouter.post("/unfollow/:blocID/:fromUsrID", unfollowBloc);

//get all details of a particular bloc
newsRouter.get(
  "/bloc/details/:blocID/:usrID/:fromUsrID",
  particularBlocDetails
);

//add new notification
newsRouter.post("/notification/add", addNotifications);

//get all notifications
newsRouter.get("/notifications/:usrID", notifications);

//get all report categories
newsRouter.get("/categories", reportCategories);

//report searching autocomplete
newsRouter.get("/reports/search/autocomplete", reportSearchAutocomplete);

//reporters searching autocomplete
newsRouter.get("/reporters/autocomplete", reporterSearchAutocomplete);

//hashtags autocomplete
newsRouter.get("/hashtags/autocomplete", hashtagsAutocomplete);