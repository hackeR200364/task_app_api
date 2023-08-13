const req = require("express/lib/request");
const {
  createTopic,
  topicByName,
  loginAdmin,
  getEmails,
  getEmailsCount,
  updateSentEmailCount,
  updateSentNotiCount,
  getAllDeviceTokens,
  getAllDeviceTokensCount,
  getAllTopicCount,
  getAllTopics,
} = require("../marketing/marketing.service");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { response } = require("express");

const fromEmail = "hello@achivie.com";

const transporter = nodemailer.createTransport({
  host: "mail.achivie.com",
  port: 465,
  auth: {
    user: fromEmail,
    pass: "RbWl]kC?M8&^",
  },
});

function extractDomainFromEmail(email) {
  const parts = email.split("@");
  if (parts.length === 2) {
    return parts[1];
  } else {
    throw new Error("Invalid email format");
  }
}

function replacePlaceholdersEmails(inputString, emailData) {
  const name = emailData.split("@")[0];
  const replacementValues = {
    name: name,
    email: emailData,
  };
  return inputString.replace(/%([^%]+)%/g, (_, placeholder) => {
    if (replacementValues.hasOwnProperty(placeholder)) {
      return replacementValues[placeholder];
    }
    return `%${placeholder}%`;
  });
}

function replacePlaceholdersNotifications(inputString, tokenData) {
  const replacementValues = {
    name: tokenData.name,
    email: tokenData.email,
  };
  return inputString.replace(/%([^%]+)%/g, (_, placeholder) => {
    if (replacementValues.hasOwnProperty(placeholder)) {
      return replacementValues[placeholder];
    }
    return `%${placeholder}%`;
  });
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

  getEmails: (req, res) => {
    const offset = (req.query.page - 1) * req.query.limit;
    getEmails(req.query.limit, offset, (err, results) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      getEmailsCount((emailCountErr, emailCount) => {
        if (emailCountErr) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        const totalPage = Math.ceil(+emailCount[0]?.count / req.query.limit);

        return res.json({
          success: false,
          message: "Got all emails",
          results: results,
          totalPage: totalPage,
        });
      });
    });
  },

  sendEmails: (req, res) => {
    const errors = [];

    req.body.emailList.forEach((emailData) => {
      const mailOptions = {
        from: fromEmail,
        to: emailData,
        subject: replacePlaceholdersEmails(req.body.subjectString, emailData),
        text: replacePlaceholdersEmails(req.body.bodyString, emailData),
        html: req.body.htmlString
          ? replacePlaceholdersEmails(req.body.htmlString, emailData)
          : undefined,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          errors.push({ email: emailData, error: error.message });
        } else {
          console.log("Email sent:", info.response);
          updateSentEmailCount(emailData, (error, result) => {
            if (error) {
              console.error(error);
              errors.push({ email: emailData, error: error });
            }
          });
        }

        if (errors.length > 0) {
          return res.json({
            success: false,
            message: "Error happend",
            errors: errors,
          });
        } else {
          return res.json({
            success: true,
            message: "All emails sent",
          });
        }
      });
    });
  },

  sendNotificationsByTopic: (req, res) => {
    const headers = {
      Authorization:
        "key=AAAAjARbMis:APA91bHlRyZM3ChZBGKcM49CmcCmJvJDjMpu7cDvcNobv9QpmaTskcG8oKRLCC4nFf-B8nsaA0gQlvXERjRfVNagQvSuvsAY6j5zPrjhmKKi5DuPwZQhNG3n-zRk3w1C0hlDZr4GSLBm",
      "Content-Type": "application/json",
    };

    axios
      .post(
        "https://fcm.googleapis.com/fcm/send",
        {
          to: `/topics/${req.body.topicName}`,
          notification: {
            title: req.body.title,
            body: req.body.body,
            message: req.body.message,
          },
        },
        {
          headers,
        }
      )
      .then((response) => {
        console.error("Response:", response.data);
        updateSentNotiCount(req.body.topicName, (err, result) => {
          if (err) {
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          return res.json({
            success: true,
            message: `All Notifications to topic ${req.body.topicName} are successfully sent.`,
            response: response.data,
          });
        });
      })
      .catch((error) => {
        console.error("Error:", error.message);
        return res.json({
          success: false,
          message: "Something went wrong",
          errors: error,
        });
      });
  },

  getDeviceTokens: (req, res) => {
    const offset = (req.query.page - 1) * req.query.limit;
    getAllDeviceTokensCount((tokenErr, tokenCount) => {
      if (tokenErr) {
        console.error(tokenErr);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      getAllDeviceTokens(req.query.limit, offset, (err, tokens) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        // console.log(tokenCount);

        const totalPage = Math.ceil(+tokenCount[0]?.count / req.query.limit);
        return res.json({
          success: true,
          message: "Get all tokens",
          totalPage: totalPage,
          data: tokens,
        });
      });
    });
  },

  getTopics: (req, res) => {
    const offset = (req.query.page - 1) * req.query.limit;
    getAllTopicCount((topicErr, topicCount) => {
      if (topicErr) {
        console.error(topicErr);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      getAllTopics(req.query.limit, offset, (err, topic) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        // console.log(tokenCount);

        const totalPage = Math.ceil(+topicCount[0]?.count / req.query.limit);
        return res.json({
          success: true,
          message: "Get all topics",
          totalPage: totalPage,
          data: topic,
        });
      });
    });
  },

  sendNotificationsByToken: (req, res) => {
    const headers = {
      Authorization:
        "key=AAAAjARbMis:APA91bHlRyZM3ChZBGKcM49CmcCmJvJDjMpu7cDvcNobv9QpmaTskcG8oKRLCC4nFf-B8nsaA0gQlvXERjRfVNagQvSuvsAY6j5zPrjhmKKi5DuPwZQhNG3n-zRk3w1C0hlDZr4GSLBm",
      "Content-Type": "application/json",
    };

    axios
      .post(
        "https://fcm.googleapis.com/fcm/send",
        {
          to: `${req.body.deviceToken}`,
          notification: {
            title: req.body.title,
            body: req.body.body,
            message: req.body.message,
          },
        },
        {
          headers,
        }
      )
      .then((response) => {
        // console.error("Response:", response.data);
        return res.json({
          success: true,
          message: "Notification sent successfully",
          response: response.data,
        });
      })
      .catch((error) => {
        console.error("Error:", error.message);
        return res.json({
          success: false,
          message: "Something went wrong",
          errors: error,
        });
      });
  },

  sendNotificationsByTokenList: (req, res) => {
    const headers = {
      Authorization:
        "key=AAAAjARbMis:APA91bHlRyZM3ChZBGKcM49CmcCmJvJDjMpu7cDvcNobv9QpmaTskcG8oKRLCC4nFf-B8nsaA0gQlvXERjRfVNagQvSuvsAY6j5zPrjhmKKi5DuPwZQhNG3n-zRk3w1C0hlDZr4GSLBm",
      "Content-Type": "application/json",
    };
    const errors = [];
    const success = [];

    req.body.tokens.forEach((tokenData) => {
      axios
        .post(
          "https://fcm.googleapis.com/fcm/send",
          {
            to: `${tokenData.token}`,
            notification: {
              title: replacePlaceholdersNotifications(
                req.body.title,
                tokenData
              ),
              body: replacePlaceholdersNotifications(req.body.body, tokenData),
              message: replacePlaceholdersNotifications(
                req.body.message,
                tokenData
              ),
            },
          },
          {
            headers,
          }
        )
        .then((response) => {
          console.log(response.data);
          success.push({ tokenData: tokenData, response: response.data });
          // console.error("Response:", response.data);
          // return res.json({
          //   success: true,
          //   message: "Notification sent successfully",
          //   response: response.data,
          // });
        })
        .catch((error) => {
          console.error("Error:", error.message);
          errors.push({ email: tokenData, error: error });

          // return res.json({
          //   success: false,
          //   message: "Something went wrong",
          //   errors: error,
          // });
        });

      if (errors.length > 0) {
        return res.json({
          success: false,
          message: "Error happend",
          errors: errors,
        });
      } else {
        return res.json({
          success: true,
          message: "All notifications sent",
          responses: success,
        });
      }
    });
  },
};
