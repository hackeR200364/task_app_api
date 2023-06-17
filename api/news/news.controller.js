require("dotenv").config();
const req = require("express/lib/request");
const {
  create,
  duplicateBlocCheck,
  blocDetails,
  newsPost,
  newsCountIncrease,
  newsDetails,
  reportLikeIncrease,
  likedRecord,
  reportCommentRecord,
  reportCommentIncrease,
  reportCommentRecordList,
  reportCommentsCount,
  reportCommentDelete,
  reportCommentCountDecrease,
  allReportsList,
  allReportsCount,
  allLikedReports,
  allcommentedReports,
} = require("./news.service");
const res = require("express/lib/response");

module.exports = {
  createBloc: (req, res) => {
    duplicateBlocCheck(req.body.usrID, (err, resBlocID) => {
      if (err) {
        console.error(err);
        return res.status(404).json({
          success: false,
          message: "Somthing went wrong",
          result: result,
        });
      }

      if (resBlocID) {
        return res.json({
          success: false,
          message: `You already have a bloc with Bloc-ID ${resBlocID.blocID} and Bloc-Name ${resBlocID.blocName}`,
        });
      }

      const timestamp = new Date().getTime();
      // const blocProfile = `https://achivie.com/blocProfile/${req.file.filename}`;
      const blocProfile = `${req.protocol}://${req.hostname}/v1/production/bloc/${req.file.filename}`;

      create(req.body, blocProfile, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(404).json({
            success: false,
            message: "Something went wrong",
          });
        }

        blocDetails(req.body.usrID, result, (err, result) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong to get your bloc details!",
            });
          }

          return res.json({
            success: true,
            message: `Congratulations! The bloc ${req.body.blocName} is created successfully for ${req.body.usrID}`,
            blockID: result,
          });
        });
      });
    });
  },

  postReport: (req, res) => {
    const files = req.files.reportImages;
    const downloadLinks = [];
    const baseURL = `${req.protocol}://${req.hostname}/v1/production/news`;
    const thumbImageLinkString = `${baseURL}/${req.files.reportTumbImage[0].filename}`;
    let fileName;
    let reportPicLink;

    files.forEach((file) => {
      fileName = file.filename;
      reportPicLink = `${baseURL}/${fileName}`;
      downloadLinks.push(reportPicLink);
      // console.log(fileName);
    });

    const downloadLinksString = downloadLinks.join(",");
    // console.log();

    newsPost(
      req.body,
      downloadLinksString,
      thumbImageLinkString,
      (err, result) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        // console.log(downloadLinksString.split(","));
        console.log(result);

        newsCountIncrease(req.body.reportUsrID, (err, result) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }
          return res.json({
            success: true,
            message: "Your report is successfully posted",
          });
        });
      }
    );
  },

  reportAllDetails: (req, res) => {
    newsDetails(req.params.usrID, req.params.reportUsrID, (err, reportRes) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      if (!reportRes) {
        return res.status(404).json({
          success: false,
          message: "Not found any report",
        });
      }
      reportRes[0].reportImages = reportRes[0].reportImages.split(",");
      console.log(reportRes[0].reportImages);
      return res.json({
        success: true,
        message: "Got the report",
        data: reportRes[0],
      });
    });
  },

  particularReportLike: (req, res) => {
    reportLikeIncrease(
      req.params.usrID,
      req.params.reportID,
      (err, reportRes) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        likedRecord(
          req.params.reportID,
          req.params.usrID,
          req.params.blocID,
          (err, reportRes) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }
            return res.json({
              success: true,
              message: "Liked",
            });
          }
        );
      }
    );
  },

  particularReportCommentPost: (req, res) => {
    reportCommentRecord(
      req.body.reportID,
      req.body.toUsrID,
      req.body.toBlocID,
      req.body.fromUsrID,
      req.body.comment,
      (err, reportRes) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        reportCommentIncrease(
          req.body.usrID,
          req.body.reportID,
          (err, reportRes) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            return res.json({
              success: true,
              message: "Comment Published",
            });
          }
        );
      }
    );
  },

  commentList: (req, res) => {
    const offset = (req.query.page - 1) * req.query.limit;
    reportCommentRecordList(
      offset,
      req.query.limit,
      req.params.reportID,
      (err, comments) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }
        if (comments.length < 1) {
          return res.json({
            success: false,
            message: "No more comments",
          });
        }

        reportCommentsCount(req.params.reportID, (err, commentsRecordCount) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          const totalPage = Math.ceil(
            +commentsRecordCount[0]?.count / req.query.limit
          );

          return res.json({
            success: true,
            message: "Got the comments",
            totalPage: totalPage,
            comments: comments,
          });
        });
      }
    );
  },

  particularReportCommentDelete: (req, res) => {
    reportCommentDelete(req.params.commentID, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      reportCommentCountDecrease(req.params.reportID, (err, result) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        return res.json({
          success: true,
          message: "Your comment was deleted",
        });
      });
    });
  },

  allReports: (req, res) => {
    const offset = (req.query.page - 1) * req.query.limit;

    allReportsCount((err, reportCount) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      const totalPage = Math.ceil(+reportCount[0]?.count / req.query.limit);

      allReportsList(offset, req.query.limit, (err, reportsList) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "No reports",
          });
        }

        if (reportsList.length < 1) {
          return res.json({
            success: false,
            message: "No more reports",
          });
        }

        allLikedReports(req.params.usrID, (err, likedReportsList) => {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              message: "No liked reports",
            });
          }

          if (likedReportsList.length < 1) {
            return res.json({
              success: true,
              reports: reportsList,
              totalPage: totalPage,
            });
          }

          console.log(likedReportsList);

          const likedRecordSet = new Set(
            likedReportsList.map((record) => record.reportID)
          );

          const reportsWithLikedStatus = reportsList.map((report) => {
            const liked = likedRecordSet.has(report.reportID);
            return { ...report, liked: liked };
          });

          allcommentedReports(req.params.usrID, (err, commentedReportsList) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            if (commentedReportsList.length < 1) {
              return res.json({
                success: true,
                reports: reportsWithLikedStatus,
                totalPage: totalPage,
              });
            }

            const commentedRecordSet = new Set(
              commentedReportsList.map((record) => record.reportID)
            );

            const reportsWithCommentedStatus = reportsWithLikedStatus.map(
              (report) => {
                const commented = commentedRecordSet.has(report.reportID);
                return { ...report, commented: commented };
              }
            );

            return res.json({
              success: true,
              message: "Got all reports",
              reports: reportsWithCommentedStatus,
              totalPage: totalPage,
            });
          });
        });
      });
    });
  },
};
