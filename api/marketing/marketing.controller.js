const req = require("express/lib/request");
const {
  createTopic,
  topicByName,
  loginAdmin,
  getEmails,
  getEmailsCount,
  updateSentEmailCount,
} = require("../marketing/marketing.service");
const nodemailer = require("nodemailer");

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

function replacePlaceholders(inputString, emailData) {
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

function sendBulkEmails(subjectString, bodyString, emailList) {
  emailList.forEach((emailData) => {
    const subject = replacePlaceholders(subjectString, emailData);
    const body = replacePlaceholders(bodyString, emailData);

    const mailOptions = {
      from: fromEmail,
      to: emailData,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  });
}

function sendBulkEmails(subjectString, bodyString, emailList) {
  return new Promise((resolve, reject) => {
    const errors = [];

    emailList.forEach((emailData) => {
      // const subject = replacePlaceholders(subjectString, emailData);
      // const body = replacePlaceholders(bodyString, emailData);

      const mailOptions = {
        from: fromEmail,
        to: emailData,
        subject: replacePlaceholders(subjectString, emailData),
        text: replacePlaceholders(bodyString, emailData),
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          errors.push({ email: emailData, error: error.message });
        } else {
          console.log("Email sent:", info.response);
        }

        // Check if all emails have been processed
        if (
          errors.length + (emailList.length - info.messageId) ===
          emailList.length
        ) {
          resolve(errors); // Resolve with errors array
        }
      });
    });
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
        subject: replacePlaceholders(req.body.subjectString, emailData),
        text: replacePlaceholders(req.body.bodyString, emailData),
        html: req.body.htmlString
          ? replacePlaceholders(req.body.htmlString, emailData)
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
};
