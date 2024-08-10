const { callbackPromise } = require("nodemailer/lib/shared");
const pool = require("../../config/database");
const crypto = require("crypto");

// Function to generate a unique pid
function generatePID(uid) {
  const timestamp = Date.now().toString(); // Get current timestamp
  const data = timestamp + uid; // Concatenate timestamp and uid
  const hash = crypto.createHash("sha256"); // Create SHA-256 hash object
  hash.update(data); // Update hash with concatenated data
  const pid = hash.digest("hex"); // Get hexadecimal digest as pid
  return pid;
}

// Get current timestamp
function getCurrentTimestamp() {
  // Create a new Date object
  const date = new Date();
  // Format the date as per your database requirements
  const timestamp = date.toISOString(); // This will give you a string in the format 'YYYY-MM-DDTHH:MM:SS.SSSZ'
  return timestamp;
}

// // Example usage
// const uid = "user1"; // Replace 'user1' with actual user ID
// const pid = generatePID(uid);
// console.log("Generated PID:", pid);

module.exports = {
  createPlayground: (data, callBack) => {
    pool.query(
      `insert into playgrounds (pid, did, p_name, p_lastEdited, p_createTimestamp, commands, uid) values(?,?,?,?,?,?,?)`,
      [
        generatePID(data.uid),
        data.did,
        data.p_name,
        getCurrentTimestamp(),
        getCurrentTimestamp(),
        "",

        data.uid,
      ],
      (error, result, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, result);
      }
    );
  },

  checkDatabaseAuth: (data, callBack) => {
    pool.query(
      `SELECT dbs.*, u.* FROM user_databases dbs JOIN users u ON dbs.uid = u.uid WHERE dbs.did = ? AND dbs.database_pass = ?`,
      [data.did, data.database_pass],
      (error, result, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, result);
      }
    );
  },

  createDatabase: (data, callBack) => {
    let did = generatePID(data.uid);
    pool.query(
      `insert into user_databases (did, db_createdTime, db_lastConnected, uid, database_usrName, database_pass) values(?,?,?,?,?,?)`,
      [
        did,
        getCurrentTimestamp(),
        getCurrentTimestamp(),
        data.uid,
        data.database_usrName,
        data.database_pass,
      ],
      (error, result, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, result, did);
      }
    );
  },

  getDatabaseDetails: (did, uid, callBack) => {
    pool.query(
      `SELECT * FROM user_databases WHERE did = ? and uid=?`,
      [did, uid],
      (error, result, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, result);
      }
    );
  },

  getDatabaseDetailsWithAuth: (data, callBack) => {
    pool.query(
      `SELECT * FROM user_databases WHERE did=? AND uid=? AND database_usrName=? AND database_pass=?`,
      [data.did, data.uid, data.database_usrName, data.database_pass],
      (error, result, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, result);
      }
    );
  },

  getPlaygrounds: (offset, limit, data, callBack) => {
    pool.query(
      `select * from playgrounds where uid=? ORDER BY p_createTimestamp DESC LIMIT ? OFFSET ?`,
      [data.uid, +limit, +offset],
      (error, results, fields) => {
        if (error) {
          console.error(error);
          return callBack(error);
        }
        console.log(fields);
        return callBack(null, results);
      }
    );
  },

  getPlayground: (data, callBack) => {
    pool.query(
      `select * from playgrounds where uid=? and pid=?`,
      [data.uid, data.pid],
      (error, result, field) => {
        if (error) {
          console.error(error);
          return callBack(error);
        }
        return callBack(null, result);
      }
    );
  },

  getProfile: (data, callBack) => {
    pool.query(
      `select u.*, dbs.* from users u join user_databases dbs on u.uid=dbs.uid where u.uid=?`,
      [data.uid],
      (error, result, field) => {
        if (error) {
          console.error(error);
          return callBack(error);
        }
        return callBack(null, result);
      }
    );
  },

  execute: (data, callBack) => {
    pool.query(`${data.command}`, (error, result, field) => {
      if (error) {
        console.error(error);
        return callBack(error);
      }
      return callBack(null, result, field);
    });
  },

  validations: (data, callBack) => {
    pool.query(
      `Select p.* from user_databases dbs join playgrounds p on dbs.did=p.did where dbs.did=? and p.pid=? and dbs.database_usrName=? and dbs.database_pass=? and p.uid=?`,
      [data.did, data.pid, data.database_usrName, data.database_pass, data.uid],
      (error, result, field) => {
        if (error) {
          console.error(error);
          return callBack(error);
        }
        return callBack(null, result, field);
      }
    );
  },

  updatePlaygroundLastEdited: (data, callBack) => {
    pool.query(
      `update playgrounds set commands=?, p_lastEdited = ? where pid=? and uid=? and did=?`,
      [data.commands, getCurrentTimestamp(), data.pid, data.uid, data.did],
      (error, result) => {
        if (error) {
          console.error(error);
          return callBack(error);
        }
        return callBack(null, result);
      }
    );
  },

  updatePlaygroundName: (data, callBack) => {
    pool.query(
      `update playgrounds set p_name=?, p_lastEdited = ? where pid=? and uid=? and did=?`,
      [data.p_name, getCurrentTimestamp(), data.pid, data.uid, data.did],
      (error, result) => {
        if (error) {
          console.error(error);
          return callBack(error);
        }
        return callBack(null, result);
      }
    );
  },

  connectDatabase: (data, callBack) => {
    pool.query(
      `update user_databases set db_lastConnected = ? where uid=? and did=?`,
      [getCurrentTimestamp(), data.uid, data.did],
      (error, result) => {
        if (error) {
          console.error(error);
          return callBack(error);
        }
        return callBack(null, result);
      }
    );
  },

  updateDatabasePass: (data, callBack) => {
    pool.query(
      `update user_databases set database_pass=? where did=? and uid=?`,
      [data.database_new_pass, data.did, data.uid],
      (error, result) => {
        if (error) {
          console.error(error);
          return callBack(error);
        }
        return callBack(null, result);
      }
    );
  },
};
