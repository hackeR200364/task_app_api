const pool = require("../../config/database");
const uuid = require("uuid");

function generateContentId() {
  const timestamp = Date.now().toString(36);
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let contentId = "";
  for (let i = 0; i < 10; i++) {
    contentId += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return contentId + timestamp;
}

function generateCommentId() {
  const timestamp = Date.now().toString(36);
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let contentId = "";
  for (let i = 0; i < 10; i++) {
    contentId += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return contentId + timestamp;
}

module.exports = {
  create: (data, blocProfile, callback) => {
    const blocID = data.blocName + "-" + data.usrID;
    pool.query(
      `insert into bloc_details(usrName, usrID, usrEmail, blocID, blocName, blocDes, usrPhoneNo, blocProfile, blocLat, blocLong, followers)value(?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.usrName,
        data.usrID,
        data.usrEmail,
        blocID,
        data.blocName,
        data.blocDes,
        data.usrPhoneNo,
        blocProfile,
        data.blocLat,
        data.blocLong,
        0,
      ],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        pool.query(
          `update users set hasBloc=true, blocName=?, blocID=? where uid=?`,
          [data.blocName, blocID, data.usrID],
          (error, results, fields) => {
            if (error) {
              return callback(error);
            }

            return callback(null, blocID);
          }
        );
      }
    );
  },

  duplicateBlocCheck: (usrID, callback) => {
    pool.query(
      `select blocName,blocID from bloc_details where usrID=?`,
      [usrID],
      (error, result, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result[0]);
      }
    );
  },

  blocDetails: (usrID, blocID, callback) => {
    pool.query(
      `select * from bloc_details where usrID=? and blocID=?`,
      [usrID, blocID],
      (error, result, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result[0]);
      }
    );
  },

  newsPost: (data, images, thumbImage, callback) => {
    const timestamp = Math.floor(Date.now() / 1000);
    console.log(timestamp);
    const reportID = generateContentId();
    pool.query(
      `insert into report_details(reportID,  reportImages, reportTumbImage, reportDate, reportTime, reportHeadline, reportDes, reportLocation, reportLikes, reportComments, reportSaved, reportBlocID, reportUsrID)values(?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        reportID,
        images,
        thumbImage,
        data.reportDate,
        data.reportTime,
        data.reportHeadline,
        data.reportDes,
        data.reportLocation,
        0,
        0,
        0,
        data.reportBlocID,
        data.reportUsrID,
      ],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, reportID);
      }
    );
  },

  newsCountIncrease: (uid, callback) => {
    pool.query(
      `update users set reportCount=reportCount+1 where uid=?`,
      [uid],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  newsDetails: (uid, reportUsrID, callback) => {
    pool.query(
      `select * from report_details where reportID=? and reportUsrID=?`,
      [reportUsrID, uid],
      (error, result, field) => {
        if (error) {
          console.error(error);
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },

  reportLikeIncrease: (uid, reportID, callback) => {
    pool.query(
      `update report_details set reportLikes=reportLikes+1 where reportID=?`,
      [reportID, uid],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  likedRecord: (reportID, likedByUsrID, likedToBlocID, callback) => {
    pool.query(
      `insert into liked_record(reportID, likedByUsrID, likedToBlocID)values(?,?,?)`,
      [reportID, likedByUsrID, likedToBlocID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  reportCommentIncrease: (uid, reportID, callback) => {
    pool.query(
      `update report_details set reportComments=reportComments+1 where reportID=?`,
      [reportID, uid],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  reportCommentRecord: (
    reportID,
    toUsrID,
    toBlocID,
    fromUsrID,
    comment,
    callback
  ) => {
    let commentID = generateCommentId();
    pool.query(
      `insert into comments_record(reportID, toUsrID, toBlocID, fromUsrID, comment, commentID)values(?,?,?,?,?,?)`,
      [reportID, toUsrID, toBlocID, fromUsrID, comment, commentID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, error);
      }
    );
  },

  reportCommentRecordList: (offset, limit, reportID, callback) => {
    pool.query(
      `select * from comments_record where reportID=? limit ? offset ?`,
      [reportID, +limit, +offset],
      (error, results, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  reportCommentsCount: (reportID, callback) => {
    pool.query(
      `select count(*) as count from comments_record where reportID=?`,
      [reportID],
      (error, results, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  reportCommentDelete: (commentID, callback) => {
    pool.query(
      `delete from comments_record where commentID=?`,
      [commentID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  reportCommentCountDecrease: (reportID, callback) => {
    pool.query(
      `update report_details set reportComments=reportComments-1 where reportID=?`,
      [reportID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },

  reportLikeDelete: (reportID, likedByUsrID, callback) => {
    pool.query(
      `delete from liked_record where reportID=? and likedByUsrID=?`,
      [reportID, likedByUsrID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  reportLikedDeleteDecrease: (reportID, callback) => {
    pool.query(
      `update report_details set reportLikes=reportLikes-1 where reportID=?`,
      [reportID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  allReportsList: (offset, limit, callback) => {
    pool.query(
      `select * from report_details order by reportDate, reportTime, reportUploadTime asc limit ${+limit} offset ${+offset}`,
      // [+limit, +offset],
      (error, results, field) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },

  allLikedReports: (likedByUsrID, callback) => {
    pool.query(
      `select reportID from liked_record where likedByUsrID=?`,
      [likedByUsrID],
      (error, results, field) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },

  allcommentedReports: (fromUsrID, callback) => {
    pool.query(
      `select reportID from comments_record where fromUsrID=?`,
      [fromUsrID],
      (error, results, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  allReportsCount: (callback) => {
    pool.query(
      `select count(*) as count from report_details`,
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  particularReportSave: (
    reportID,
    usrLat,
    usrLong,
    toUsrID,
    fromUsrID,
    toBlocID,
    callback
  ) => {
    pool.query(
      `insert into saved_record(reportID, usrLat, usrLong, toUsrID, fromUsrID, toBlocID)values(?,?,?,?,?,?)`,
      [reportID, usrLat, usrLong, toUsrID, fromUsrID, toBlocID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  particularReportSaveIncrease: (reportID, callback) => {
    pool.query(
      `update report_details set reportSaved=reportSaved+1 where reportID=?`,
      [reportID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  particularReportUnSave: (reportID, fromUsrID, callback) => {
    pool.query(
      `delete from saved_record where reportID=? and fromUsrID=?`,
      [reportID, fromUsrID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  particularReportUnSaveDecrease: (reportID, callback) => {
    pool.query(
      `update report_details set reportSaved=reportSaved-1 where reportID=?`,
      [reportID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  followBloc: (
    blocID,
    fromUsrID,
    followedLat,
    followedLong,
    toUsrID,
    callback
  ) => {
    pool.query(
      `insert into bloc_follow_record(blocID, fromUsrID, followedLat, followedLong, toUsrID)values(?,?,?,?,?)`,
      [blocID, fromUsrID, followedLat, followedLong, toUsrID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  blocFollowerIncrease: (blocID, callback) => {
    pool.query(
      `update bloc_details set followers=followers+1 where blocID=?`,
      [blocID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  usrFollowingIncrease: (usrID, callback) => {
    pool.query(
      `update users set following=following+1 where uid=?`,
      [usrID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  unFollowBloc: (blocID, fromUsrID, callback) => {
    pool.query(
      `delete from bloc_follow_record where blocID=? and fromUsrID=?`,
      [blocID, fromUsrID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, error);
      }
    );
  },

  blocFollowerDecrease: (blocID, callback) => {
    pool.query(
      `update bloc_details set followers=followers-1 where blocID=?`,
      [blocID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  usrFollowingDecrease: (usrID, callback) => {
    pool.query(
      `update users set following=following-1 where uid=?`,
      [usrID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  particularBlocTopReports: (blocID, offset, limit, callback) => {
    pool.query(
      `select * from report_details where reportBlocID=? order by reportLikes, reportComments, reportSaved desc limit ${+limit} offset ${+offset}`,
      [blocID, limit, offset],
      (error, results, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  particularBlocReports: (blocID, offset, limit, callback) => {
    pool.query(
      `select * from report_details where reportBlocID=? limit ${+limit} offset ${+offset}`,
      [blocID, limit, offset],
      (error, results, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  particularBlocReportsCount: (blocID, callback) => {
    pool.query(
      `select count(*) as count from report_details where reportBlocID=?`,
      [blocID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },

  particularUsrLikedReports: (likedByUsrID, offset, limit, callback) => {
    pool.query(
      `SELECT rd.* FROM liked_record lr JOIN report_details rd ON lr.reportID = rd.reportID WHERE lr.likedByUsrID=? limit ${+limit} offset ${+offset}`,
      [likedByUsrID],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  particularUsrLikedReportsCounts: (likedByUsrID, callback) => {
    pool.query(
      `select count(*) as count from liked_record where likedByUsrID=?`,
      [likedByUsrID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },
};
