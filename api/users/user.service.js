const pool = require("../../config/database");

module.exports = {
  create: (data, callBack) => {
    pool.query(
      `insert into users(usrFirstName, usrLastName, usrPassword, uid, taskBusiness, taskCount, taskDelete, taskPending, taskPersonal, usrEmail, taskDone, usrPoints)values(?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.usrFirstName,
        data.usrLastName,
        data.usrPassword,
        data.uid,
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
      `select * from users where usrEmail = ?`,
      [email],
      (error, results, fields) => {
        if (error) {
          callback(error);
        }
        return callback(null, results[0]);
      }
    );
  },
};
