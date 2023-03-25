const pool = require("../../config/database");

module.exports = {
  create: (data, callBack) => {
    pool.query(
      `insert into users(usrFirstName, usrLastName, usrPassword, uid, usrProfilePic, usrDescription, usrProfession, taskBusiness, taskCount, taskDelete, taskPending, taskPersonal, usrEmail, taskDone, usrPoints)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.usrFirstName,
        data.usrLastName,
        data.usrPassword,
        data.uid,
        data.usrFirstName + data.usrLastName,
        data.usrDescription,
        data.usrProfession,
        0,
        0,
        0,
        0,
        0,
        data.usrEmail,
        0,
        0,
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }

        pool.query(
          `insert into words(words, uid)values('hello',?)`,
          [data.uid],
          (error, result, field) => {
            if (error) {
              console.log(error);
            }
          }
        );

        return callBack(null, results);
      }
    );
  },

  updateProfilePicture: (usrProfilePic, uid, callBack) => {
    pool.query(
      `update users usrProfilePic set usrProfilePic=? where uid=?`,
      [usrProfilePic, uid],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },

  getUserByUserID: (id, callback) => {
    pool.query(
      `select * from users where uid = ?`,
      // `select usrFirstName,usrLastName,description,gender,email,phoneNumber,password,profileImage,countryCode,regDate,regTime,otp from users where usrID = ?`,
      [id],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results[0]);
      }
    );
  },

  getUserByUserEmail: (email, callback) => {
    pool.query(
      `select * from users where usrEmail=?`,
      [email],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results[0]);
      }
    );
  },

  storeResetToken: (uid, resetToken, callBack) => {
    pool.query(
      `insert into pass_reset(uid, resetToken, expirationTime)values(?,?,NOW() + interval 15 minute)`,
      [uid, resetToken],
      (error, result, fields) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, result);
      }
    );
  },

  passResetUserExists: (uid, callBack) => {
    pool.query(
      `select * from pass_reset where uid=?`,
      [uid],
      (error, results, fields) => {
        if (error) {
          console.log(error);
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },

  updatePassword: (email, password, callBack) => {
    pool.query(
      `update users usrPassword set usrPassword=? where usrEmail=?`,
      [password, email],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },

  deleteResetPassToken: (uid, resetToken, callBack) => {
    pool.query(
      `delete from pass_reset where uid=? and resetToken=?`,
      [uid, resetToken],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },

  checkPassResetTokenAndTime: (resetToken, callBack) => {
    pool.query(
      `select uid from pass_reset where resetToken=? and expirationTime > NOW()`,
      [resetToken],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },

  getTaskRecords: (uid, callBack) => {
    pool.query(
      `select taskBusiness, taskPersonal, taskCount, taskDelete, taskPending, taskDone, usrPoints from users where uid=?`,
      [uid],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return callBack(err);
        }

        return callBack(null, results);
      }
    );
  },
};
