const req = require("express/lib/request");
const {
  createTopic,
  topicByName,
  loginAdmin,
} = require("../marketing/marketing.service");

function extractDomainFromEmail(email) {
  const parts = email.split("@");
  if (parts.length === 2) {
    return parts[1];
  } else {
    throw new Error("Invalid email format");
  }
}

module.exports = {
  login: (req, res) => {
    if ("team.achivie.com" === extractDomainFromEmail(req.body.email)) {
      loginAdmin(req.body, (err, results) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        if (results.length == 0) {
          return res.json({
            success: false,
            message:
              "There are no admin with this email. Please contact with your organization",
          });
        } else {
          if (req.body.password === results[0].admin_password) {
            return res.json({
              success: true,
              message: "Got your admin account",
              data: results[0],
            });
          } else {
            return res.json({
              success: false,
              message: "Wrong password",
            });
          }
        }
      });
    } else {
      return res.json({
        success: false,
        message: "You are not an Achivie's admin",
      });
    }
  },

  addTopic: (req, res) => {
    const body = req.body;

    topicByName(req.body.topicName, (err, results) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      if (results.length == 0) {
        createTopic(body, (error, result) => {
          if (error) {
            console.error(error);
            return res.json({
              success: false,
              message: "Database connection error",
            });
          }

          return res.json({
            success: true,
            message: "New topic added",
            result: result,
          });
        });
      } else {
        return res.json({
          success: false,
          message: "This topic is already subscribed",
        });
      }
    });
  },
};
