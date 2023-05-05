const pool = require("../../config/database");

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
};
