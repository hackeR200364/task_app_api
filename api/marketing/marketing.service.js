const pool = require("../../config/database");

function generatetopicID() {
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
  loginAdmin: (data, callback) => {
    pool.query(
      `select * from organization_admins where admin_email=?`,
      [data.email, data.password],
      (error, result, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  createTopic: (data, callback) => {
    let topicID = generatetopicID();
    pool.query(
      `insert into topics(topicID, topicName, addedByEmail, addedLat, addedLong, addedByIP)values(?,?,?,?,?,?)`,
      [topicID, data.topicName, data.email, data.lat, data.long, data.ip],
      (error, result, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, topicID);
      }
    );
  },

  topicByName: (topicName, callback) => {
    pool.query(
      `select * from topics where topicName=?`,
      [topicName],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  getEmails: (limit, offset, callback) => {
    pool.query(
      `Select * from marketing_emails limit ? offset ?`,
      [+limit, +offset],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  getEmailsCount: (callback) => {
    pool.query(
      `Select count(*) as count from marketing_emails`,
      (error, result, field) => {
        if (error) {
          return callback(error);
        }

        return callback(null, result);
      }
    );
  },

  updateSentEmailCount: (email, callback) => {
    pool.query(
      `Update marketing_emails emailCount set emailCount=emailCount+1 where email=?`,
      [email],
      (err, result, field) => {
        if (err) {
          return callback(err);
        }

        return callback(null, result);
      }
    );
  },

  updateSentNotiCount: (topicName, callback) => {
    pool.query(
      `Update topics notificationCount set notificationCount=notificationCount+1 where topicName=?`,
      [topicName],
      (err, result, field) => {
        if (err) {
          return callback(err);
        }

        return callback(null, result);
      }
    );
  },

  getAllDeviceTokens: (limit, offset, callback) => {
    pool.query(
      `SELECT usrFirstName, usrLastName, uid, notificationToken, usrProfilePic, usrDescription, usrProfession, usrEmail FROM users WHERE notificationToken <> '' LIMIT ? OFFSET ?`,
      [+limit, +offset],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  getAllDeviceTokensCount: (callback) => {
    pool.query(
      `Select count(*) as count from users where notificationToken <> ''`,
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },
};
