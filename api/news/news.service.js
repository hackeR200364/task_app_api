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

function generateNotificationId() {
  const timestamp = Date.now().toString(36);
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
      `insert into bloc_details(usrName, usrID, usrEmail, blocID, blocName, blocDes, usrPhoneNo, blocProfile, blocLat, blocLong, followers, reportsCount)value(?,?,?,?,?,?,?,?,?,?,?,?)`,
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
    // const timestamp = Math.floor(Date.now() / 1000);
    // console.log(timestamp);
    const reportID = generateContentId();
    pool.query(
      `insert into report_details(reportID,  reportImages, reportTumbImage, reportDate, reportTime, reportHeadline, reportDes, reportLocation, reportLikes, reportComments, reportSaved, reportBlocID, reportUsrID, reportCat)values(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
        data.reportCat,
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
      `update bloc_details set reportsCount=reportsCount+1 where usrID=?`,
      [uid],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  newsDetails: (reportUsrID, reportID, callback) => {
    pool.query(
      `SELECT rd.*, bd.* FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE rd.reportID = ? AND rd.reportUsrID = ?`,
      [reportID, reportUsrID],
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
      `SELECT cr.*, u.* FROM comments_record cr JOIN users u ON cr.fromUsrID = u.uid WHERE cr.reportID = ? LIMIT ? OFFSET ?`,
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
      `SELECT rd.*, bd.* FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID ORDER BY rd.reportDate, rd.reportTime, rd.reportUploadTime ASC LIMIT ${+limit} OFFSET ${+offset}; `,
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
      `SELECT lr.reportID, bd.* FROM liked_record lr JOIN report_details rd ON lr.reportID = rd.reportID JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE lr.likedByUsrID = ?`,
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
      `SELECT rd.*, bd.* FROM liked_record lr JOIN report_details rd ON lr.reportID = rd.reportID JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE lr.likedByUsrID = ? LIMIT ${+limit} OFFSET ${+offset}`,
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

  searchingTopReports: (search_string, limit, offset, callback) => {
    pool.query(
      `SELECT rd.*, bd.* FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE rd.reportHeadline LIKE '%${search_string}%' OR rd.reportDes LIKE '%${search_string}%' ORDER BY bd.followers DESC, rd.reportLikes DESC, rd.reportComments DESC, rd.reportSaved DESC, rd.reportUploadTime DESC limit ${+limit} offset ${+offset}`,
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  searchingReportsCount: (search_string, callback) => {
    pool.query(
      `SELECT COUNT(rd.reportID) AS reportsCount FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE rd.reportHeadline LIKE '%${search_string}%' OR rd.reportDes LIKE '%${search_string}%'`,
      (error, result, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  searchingAllReports: (search_string, limit, offset, callback) => {
    pool.query(
      `SELECT rd.* , bd.* FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE rd.reportHeadline LIKE '%${search_string}%' OR rd.reportDes LIKE '%${search_string}%' ORDER BY rd.reportUploadTime DESC LIMIT ${+limit} OFFSET ${+offset}`,
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  searchReporters: (search_string, limit, offset, callback) => {
    pool.query(
      `SELECT * FROM bloc_details WHERE usrName LIKE '%${search_string}%' OR usrID LIKE '%${search_string}%' OR usrEmail LIKE '%${search_string}%' OR blocID LIKE '%${search_string}%' OR blocName LIKE '%${search_string}%' OR blocDes LIKE '%${search_string}%' OR usrPhoneNo LIKE '%${search_string}%' ORDER BY followers DESC, reportsCount DESC LIMIT ${+limit} OFFSET ${+offset}`,
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  searchReportersCount: (search_string, callback) => {
    pool.query(
      `SELECT COUNT(*) AS reportersCount FROM bloc_details WHERE usrName LIKE '%${search_string}%' OR usrID LIKE '%${search_string}%' OR usrEmail LIKE '%${search_string}%' OR blocID LIKE '%${search_string}%' OR blocName LIKE '%${search_string}%' OR blocDes LIKE '%${search_string}%' OR usrPhoneNo LIKE '%${search_string}%'`,
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  particularUsrFollowedBloc: (fromUsrID, callback) => {
    pool.query(
      `select blocID from bloc_follow_record where fromUsrID=?`,
      [fromUsrID],
      (error, results, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  particularUsrFollowedBlocCount: (fromUsrID, callback) => {
    pool.query(
      `select count(*) from bloc_follow_record where fromUsrID=?`,
      [fromUsrID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  topReports: (limit, offset, callback) => {
    pool.query(
      `SELECT rd.*, bd.* FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE bd.followers = (SELECT MAX(followers) FROM bloc_details) ORDER BY rd.reportUploadTime DESC, rd.reportTime DESC, rd.reportDate DESC LIMIT ${+limit} OFFSET ${+offset}`,
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  topReportsCount: (callback) => {
    pool.query(
      `SELECT COUNT(rd.reportID) AS reportCount FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE bd.followers = (SELECT MAX(followers) FROM bloc_details)`,
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  recentReports: (limit, offset, callback) => {
    pool.query(
      `SELECT rd.*, bd.* FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE TIMESTAMPDIFF(MINUTE, rd.reportUploadTime, NOW()) >= 15 ORDER BY rd.reportUploadTime DESC LIMIT ${+limit} OFFSET ${+offset}`,
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  recentReportCount: (callback) => {
    pool.query(
      `SELECT COUNT(*) AS reportCount FROM report_details WHERE TIMESTAMPDIFF(MINUTE, reportUploadTime, NOW()) >= 15`,
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  addNotifications: (reportID, blocID, blocUsrID, title, callback) => {
    let notificationID = generateContentId();
    pool.query(
      `INSERT INTO notification_record (reportID, notificationID, blocID, blocUsrID, title) VALUES (?, ?, ?, ?, ?)`,
      [reportID, notificationID, blocID, blocUsrID, title],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, notificationID);
      }
    );
  },

  notifications: (usrID, limit, offset, callback) => {
    pool.query(
      `SELECT rd.*, bd.*, nr.* FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID JOIN notification_record nr ON rd.reportID = nr.reportID JOIN bloc_follow_record bfr ON bd.blocID = bfr.blocID WHERE bfr.fromUsrID=? ORDER BY nr.notificationTime DESC LIMIT ${+limit} OFFSET ${+offset}`,
      [usrID],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  notificationsCount: (usrID, callback) => {
    pool.query(
      `SELECT COUNT(*) AS notificationCount FROM notification_record nr JOIN bloc_follow_record bfr ON nr.blocID = bfr.blocID WHERE bfr.fromUsrID = ?`,
      [usrID],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  searchReportByCategory: (category, limit, offset, callback) => {
    pool.query(
      `SELECT rd.*, bd.* FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE rd.reportCat=? ORDER BY rd.reportUploadTime DESC, rd.reportDate DESC, rd.reportTime DESC LIMIT ${+limit} OFFSET ${+offset}`,
      [category],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  searchReportByCategoryCount: (category, callback) => {
    pool.query(
      `SELECT COUNT(*) AS reportCount FROM report_details rd JOIN bloc_details bd ON rd.reportBlocID = bd.blocID WHERE rd.reportCat=?`,
      [category],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },
};
