const req = require("express/lib/request");
const {
  createTopic,
  topicByName,
  loginAdmin,
  getEmailsMarketingCount,
  updateSentEmailCount,
  updateSentNotiCount,
  getAllDeviceTokens,
  getAllDeviceTokensCount,
  getAllTopicCount,
  getAllTopics,
  getEmailsUsersCount,
  getEmailsUsers,
  getEmailsMarketing,
} = require("../marketing/marketing.service");
const nodemailer = require("nodemailer");
const axios = require("axios");
var jwt = require("jsonwebtoken");

const fromEmailMarketing = "hello@achivie.com";
const fromEmailAlert = "team@achivie.com";
var locationData;

const transporterMarketing = nodemailer.createTransport({
  host: "mail.achivie.com",
  port: 465,
  auth: {
    user: fromEmailMarketing,
    pass: "RbWl]kC?M8&^",
  },
});

const transporterAlert = nodemailer.createTransport({
  host: "mail.achivie.com",
  port: 465,
  auth: {
    user: fromEmailAlert,
    pass: "QA5d9bYw_!MJ",
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

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function capitalizeWords(str) {
  return str.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
}

function replacePlaceholdersEmailsMarketing(inputString, emailData) {
  const name = emailData.split("@")[0];
  const replacementValues = {
    name: capitalizeFirstLetter(name),
    email: emailData,
  };
  return inputString.replace(/%([^%]+)%/g, (_, placeholder) => {
    if (replacementValues.hasOwnProperty(placeholder)) {
      return replacementValues[placeholder];
    }
    return `%${placeholder}%`;
  });
}

function replacePlaceholdersEmailsUsers(inputString, emailData) {
  const replacementValues = {
    name: capitalizeWords(emailData.name),
    email: emailData.email,
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
            axios
              .get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${req.body.lat}&lon=${req.body.long}`
              )
              .then((response) => {
                locationData = response.data;
                console.log("Location Data:", locationData.display_name);

                if (locationData) {
                  // console.log("Location Data:", locationData);
                  const mailOptions = {
                    from: fromEmailAlert,
                    to: req.body.email,
                    subject: `Login Alert`,
                    html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        
        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background-color: #007BFF;
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            color: #ffffff;
            margin: 0;
            padding: 0;
        }
        
        .content {
            padding: 30px;
        }
        
        .content p {
            color: #333333;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .alert {
            background-color: #ffdddd;
            border: 1px solid #ff9999;
            padding: 20px;
            border-radius: 5px;
        }
        
        .map {
            text-align: center;
            margin-top: 20px;
        }
        
        .map img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
        }
        
        .footer {
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
            color: #888888;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Login Alert</h1>
        </div>
        <div class="content">
            <p>Dear ${results[0].admin_name},</p>
            <p>We have detected a recent login to your account. If this was not you, please take immediate action to secure your account.</p>
            <div class="alert">
                <p><strong>Login Details:</strong></p>
                <p><strong>Date and Time:</strong> ${req.body.time}</p>
                <p><strong>Location:</strong><a href="https://www.google.com/maps/search/?api=1&query=${req.body.lat},${req.body.long}" target="_blank">${locationData.display_name}</a></p>
                <p><strong>IP Address:</strong> ${req.body.ip}</p>
            </div>
            <p>If you authorized this login, you can disregard this email. If you suspect any unauthorized activity, please contact with us at team@achivie.com.</p>
        </div>
    </div>
</body>
</html>
`,
                  };

                  transporterMarketing.sendMail(mailOptions, (error, info) => {
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
                  let secret = "qwe1234";
                  const jsonToken = jwt.sign({ result: results[0] }, secret);
                  console.error(jsonToken);
                  return res.json({
                    success: true,
                    message: "Got your admin account",
                    token: jsonToken,
                    data: results[0],
                  });
                } else {
                  console.log("Location not found");
                }
              })
              .catch((error) => {
                console.error("Error:", error.message);
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

  getEmailsMarketing: (req, res) => {
    const offset = (req.query.page - 1) * req.query.limit;
    getEmailsMarketing(req.query.limit, offset, (err, results) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      getEmailsMarketingCount((emailCountErr, emailCount) => {
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

  getEmailsOfUsers: (req, res) => {
    const offset = (req.query.page - 1) * req.query.limit;
    getEmailsUsers(req.query.limit, offset, (err, results) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      getEmailsUsersCount((emailCountErr, emailCount) => {
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

  sendEmailsMarketing: (req, res) => {
    const errors = [];

    req.body.emailList.forEach((emailData) => {
      const mailOptions = {
        from: fromEmailMarketing,
        to: emailData,
        subject: replacePlaceholdersEmailsMarketing(
          req.body.subjectString,
          emailData
        ),
        text: replacePlaceholdersEmailsMarketing(
          req.body.bodyString,
          emailData
        ),
        html: req.body.htmlString
          ? replacePlaceholdersEmailsMarketing(req.body.htmlString, emailData)
          : undefined,
      };

      transporterMarketing.sendMail(mailOptions, (error, info) => {
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
      });
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
        message: "All emails sent",
      });
    }
  },

  sendEmailsUsers: (req, res) => {
    const errors = [];

    req.body.emailList.forEach((emailData) => {
      const mailOptions = {
        from: fromEmailMarketing,
        to: emailData.email,
        subject: replacePlaceholdersEmailsUsers(
          req.body.subjectString,
          emailData
        ),
        text: replacePlaceholdersEmailsUsers(req.body.bodyString, emailData),
        html: req.body.htmlString
          ? replacePlaceholdersEmailsUsers(req.body.htmlString, emailData)
          : undefined,
      };

      transporterMarketing.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          errors.push({ email: emailData, error: error.message });
        } else {
          console.log("Email sent:", info.response);
          // updateSentEmailCount(emailData, (error, result) => {
          //   if (error) {
          //     console.error(error);
          //     errors.push({ email: emailData, error: error });
          //   }
          // });
        }
      });
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
        message: "All emails sent",
      });
    }
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
          to: `${req.body.tokenData.token}`,
          notification: {
            title: replacePlaceholdersEmailsUsers(
              req.body.title,
              req.body.tokenData
            ),
            body: replacePlaceholdersEmailsUsers(
              req.body.body,
              req.body.tokenData
            ),
            message: replacePlaceholdersEmailsUsers(
              req.body.message,
              req.body.tokenData
            ),
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

  // sendNotificationsByTokenList: (req, res) => {
  //   const errors = [];
  //   const success = [];

  //   const headers = {
  //     Authorization:
  //       "key=AAAAjARbMis:APA91bHlRyZM3ChZBGKcM49CmcCmJvJDjMpu7cDvcNobv9QpmaTskcG8oKRLCC4nFf-B8nsaA0gQlvXERjRfVNagQvSuvsAY6j5zPrjhmKKi5DuPwZQhNG3n-zRk3w1C0hlDZr4GSLBm",
  //     "Content-Type": "application/json",
  //   };

  //   req.body.tokenData.forEach((tokenData) => {
  //     axios
  //       .post(
  //         "https://fcm.googleapis.com/fcm/send",
  //         {
  //           to: `${tokenData.token}`,
  //           notification: {
  //             title: replacePlaceholdersNotifications(
  //               req.body.title,
  //               tokenData
  //             ),
  //             body: replacePlaceholdersNotifications(req.body.body, tokenData),
  //             message: replacePlaceholdersNotifications(
  //               req.body.message,
  //               tokenData
  //             ),
  //           },
  //         },
  //         {
  //           headers,
  //         }
  //       )
  //       .then((response) => {
  //         console.log(response.data);
  //         success.push({ tokenData: tokenData, response: response.data });
  //         console.log(success.length);
  //         // console.error("Response:", response.data);
  //         // return res.json({
  //         //   success: true,
  //         //   message: "Notification sent successfully",
  //         //   response: response.data,
  //         // });
  //       })
  //       .catch((error) => {
  //         console.error("Error:", error.message);
  //         errors.push({ email: tokenData, error: error });

  //         // return res.json({
  //         //   success: false,
  //         //   message: "Something went wrong",
  //         //   errors: error,
  //         // });
  //       });
  //   });

  //   if (errors.length > 0) {
  //     return res.json({
  //       success: false,
  //       message: "Error happend",
  //       errors: errors,
  //     });
  //   } else {
  //     return res.json({
  //       success: true,
  //       message: "All notifications sent",
  //       responses: success,
  //     });
  //   }
  // },

  sendNotificationsByTokenList: async (req, res) => {
    const headers = {
      Authorization:
        "key=AAAAjARbMis:APA91bHlRyZM3ChZBGKcM49CmcCmJvJDjMpu7cDvcNobv9QpmaTskcG8oKRLCC4nFf-B8nsaA0gQlvXERjRfVNagQvSuvsAY6j5zPrjhmKKi5DuPwZQhNG3n-zRk3w1C0hlDZr4GSLBm",
      "Content-Type": "application/json",
    };

    const tokenDataList = req.body.tokenData;
    const requests = tokenDataList.map(async (tokenData) => {
      try {
        const response = await axios.post(
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
        );
        return { tokenData: tokenData, response: response.data };
      } catch (error) {
        console.error("Error:", error.message);
        return { tokenData: tokenData, error: error.message };
      }
    });

    try {
      const responses = await Promise.all(requests);
      const successResponses = responses.filter((response) => !response.error);

      if (successResponses.length > 0) {
        return res.json({
          success: true,
          message: "All notifications sent",
          responses: successResponses,
        });
      } else {
        return res.json({
          success: false,
          message: "Error happened",
          errors: responses,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: "An error occurred",
        error: error.message,
      });
    }
  },
};
