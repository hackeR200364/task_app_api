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
      `insert into bloc_details(usrName, usrID, usrEmail, blocID, blocName, blocDes, usrPhoneNo, blocProfile, blocLat, blocLong)value(?,?,?,?,?,?,?,?,?,?)`,
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
      `insert into report_details(reportID,  reportImages, reportTumbImage, reportDate, reportTime, reportHeadline, reportDes, reportLocation, reportLikes, reportComments, reportBlocID, reportUsrID)values(?,?,?,?,?,?,?,?,?,?,?,?)`,
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
      `select * from report_details limit ? offset ?`,
      [+limit, +offset],
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
};
