require("dotenv").config();
const {
  create,
  getUserByUserEmail,
  getUserByUserID,
  storeResetToken,
  passResetUserExists,
  updatePassword,
  deleteResetPassToken,
  checkPassResetTokenAndTime,
  getTaskRecords,
  updateProfilePicture,
  hasAccount,
  storeOTP,
  checkVerificationStatus,
  updateVerificationStatus,
  deleteOTP,
  expiryCheck,
  updateOTP,
  resend,
} = require("../users/user.service");

const { genSaltSync, hashSync, compareSync } = require("bcrypt");
var jwt = require("jsonwebtoken");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const url = require("url");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { error } = require("console");

module.exports = {
  createUser: (req, res) => {
    const body = req.body;
    hasAccount(body.uid, (error, results) => {
      if (error) {
        console.log(error);
        return res.json({
          success: false,
          message: "Database connection error",
        });
      }

      // console.log(results[0].count);
      //   const imagesDir = path.join(__dirname, "public", "images");
      //   console.log(__dirname);
      //   console.log(results[0].count);

      if (results[0].count === 0) {
        const salt = genSaltSync(10);
        body.usrPassword = hashSync(body.usrPassword, salt);
        create(body, (err, result) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Registration failed",
            });
          }

          if (!result) {
            return res.json({
              success: false,
              message: "Something Went Wrong",
            });
          }

          const profilePictureUrl = `https://achivie.com/profilePics/${req.file.filename}`;

          updateProfilePicture(profilePictureUrl, body.uid, (err, result) => {
            if (err) {
              console.error(err);
              return;
            }

            if (!result) {
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            getUserByUserID(body.uid, (usrDetailErr, usrDetails) => {
              if (usrDetailErr) {
                console.error(usrDetailErr);
                return res.json({
                  success: false,
                  message: "Registration failed 504",
                });
              }

              if (!usrDetails) {
                return res.json({
                  success: false,
                  message: "Registration failed",
                });
              }

              if (usrDetails) {
                // fs.mkdir(`profiles/${req.body.uid}`, (err) => {
                //   if (err) throw err;
                //   console.log(
                //     `Folder created successfully with name ${req.body.uid}`
                //   );
                // });
                console.error(usrDetails);

                // const user = usrDetails[0];

                // const payload = {
                //   usrFirstName: user.usrFirstName,
                //   usrLastName: user.usrLastName,
                //   uid: user.uid,
                //   usrEmail: user.usrEmail,
                //   usrPassword: user.usrPassword
                // };
                // .toString('utf-8')

                let secret = "qwe1234";

                const jsonToken = jwt.sign({ result: usrDetails }, secret);

                console.error(jsonToken);

                const otp = crypto.randomInt(10000000, 99999999);

                storeOTP(body.uid, jsonToken, otp, (otpErr, otpDetails) => {
                  if (otpErr) {
                    console.error(otpErr);
                    return res.json({
                      success: false,
                      message: "OTP Generation Failed",
                    });
                  }

                  const transporter = nodemailer.createTransport({
                    host: "mail.achivie.com",
                    port: 465,
                    auth: {
                      user: "donotreply.verification@achivie.com", // your email address
                      pass: "OrFoc(?tS)p9", // your email password
                    },
                  });

                  const mailOptions = {
                    from: "donotreply.verification@achivie.com",
                    to: body.usrEmail, // user's email address
                    subject: "OTP Verification",
                    text: `Your OTP is ${otp}. Please enter this otp to the otp verification field correctly to verify your account.`,
                  };

                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error);
                      return res.json({
                        success: false,
                        message: "Email sent failed",
                      });
                    } else {
                      console.log("Email sent: " + info.response);
                      return res.status(200).json({
                        success: true,
                        message:
                          "Registration successful\nOTP was sent to your email valid for 10 minutes",
                        token: jsonToken,
                        data: usrDetails,
                        emailResID: info.response,
                        otp: otp,
                      });
                    }
                  });
                });
              }
            });
          });
        });
      } else {
        return res.status(501).json({
          success: false,
          message: "You already have an account. Please try to login",
        });
      }

      // return res.json({
      //   success: false,
      //   message: "Something went wrong",
      // });
    });
  },

  login: (req, res) => {
    const body = req.body;

    checkVerificationStatus(body.uid, (statusErr, statusResult) => {
      if (statusErr) {
        console.log(statusErr);
        return res.json({
          success: false,
          message: "Verification status failed",
        });
      }

      console.error(statusResult);

      if (!statusResult[0]) {
        return res.json({
          success: false,
          message: "You didn't have any account. Please register",
        });
      }

      if (statusResult[0].verified == true) {
        getUserByUserEmail(body.usrEmail, (err, results) => {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }
          if (!results) {
            return res.json({
              success: false,
              message: "You didn't have any account. Please register",
            });
          }
          const result = compareSync(body.usrPassword, results.usrPassword);
          if (result) {
            results.password = undefined;
            const jsonToken = jwt.sign(
              { result: result },
              process.env.ENCRYPTION_KEY
            );
            return res.status(200).json({
              success: true,
              message: "Login successfully",
              token: jsonToken,
              data: results,
            });
          } else {
            return res.json({
              success: false,
              message: "Invalid email or password",
            });
          }
        });
      } else {
        let secret = "qwe1234";

        const jsonToken = jwt.sign(
          {
            usrEmail: body.usrEmail,
            usrPassword: body.usrPassword,
            uid: body.uid,
          },
          secret
        );

        console.error(jsonToken);

        const otp = crypto.randomInt(10000000, 99999999);

        updateOTP(body.uid, jsonToken, otp, (otpErr, otpDetails) => {
          if (otpErr) {
            console.error(otpErr);
            return res.json({
              success: false,
              message: "OTP Generation Failed",
            });
          }

          const transporter = nodemailer.createTransport({
            host: "mail.achivie.com",
            port: 465,
            auth: {
              user: "donotreply.verification@achivie.com", // your email address
              pass: "OrFoc(?tS)p9", // your email password
            },
          });

          const mailOptions = {
            from: "donotreply.verification@achivie.com",
            to: body.usrEmail, // user's email address
            subject: "OTP Verification",
            text: `Your OTP is ${otp}. Please enter this otp to the otp verification field correctly to verify your account.`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.json({
                success: false,
                message: "Email sent failed",
              });
            }

            console.log("Email sent: " + info.response);
            return res.status(403).json({
              success: false,
              message:
                "Your email is not verified. A new OTP was sent to your email.",
              verificationToken: jsonToken,
              otp: otp,
              emailResID: info.response,
            });
          });
        });
      }
    });
  },

  verification: (req, res) => {
    expiryCheck(
      req.params.uid,
      req.params.verificationToken,
      (error, results) => {
        if (error) {
          console.log(error);
          return res.json({
            success: false,
            message: "Expiration time error",
          });
        }

        console.error(results);
        //error
        if (results[0].uid === req.params.uid) {
          updateVerificationStatus(
            req.params.uid,
            (updateErr, updateResult) => {
              if (updateErr) {
                console.log(updateErr);
                return res.json({
                  success: false,
                  message: "Update verification status failed",
                });
              }

              deleteOTP(
                req.params.uid,
                req.params.verificationToken,
                req.params.otp,
                (deleteOTPErr, deleteOTPResult) => {
                  if (deleteOTPErr) {
                    console.log(deleteOTPErr);
                    return res.json({
                      success: false,
                      message: "OTP deletion failed",
                    });
                  }

                  return res.json({
                    success: true,
                    message: "Your email is verified.",
                  });
                }
              );
            }
          );
        } else {
          return res.json({
            success: false,
            message: "Email verification failed",
          });
        }
      }
    );
  },

  googleLogin: (req, res) => {
    const body = req.body;
    const salt = genSaltSync(10);
    body.usrPassword = hashSync(body.usrPassword, salt);
    getUserByUserEmail(req.body.usrEmail, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Database connection error",
        });
      }

      if (!results) {
        create(req.body, (err, result) => {
          if (err) {
            console.log(err);
            return;
          }

          if (!result) {
            return res.json({
              success: false,
              message: "Something Went Wrong",
            });
          }

          const jsonToken = sign(
            { result: result },
            process.env.ENCRYPTION_KEY
          );

          getUserByUserID(req.body.uid, (usrDetailErr, usrDetails) => {
            if (usrDetailErr) {
              console.log(usrDetailErr);
              return;
            }

            if (!usrDetails) {
              return res.json({
                success: false,
                message: "Registration failed",
              });
            }

            if (usrDetails) {
              const result = compareSync(
                req.body.usrPassword,
                usrDetails.usrPassword
              );
              if (result) {
                usrDetails.password = undefined;
                // const jsonToken = sign(
                //   { result: result },
                //   process.env.ENCRYPTION_KEY
                // );
                return res.json({
                  success: true,
                  message: "Login successfully",
                  token: jsonToken,
                  data: usrDetails,
                });
              } else {
                return res.json({
                  success: false,
                  message: "Login failed",
                  data: usrDetails,
                });
              }

              // return res.json({
              //   success: true,
              //   message: "Registration successful",
              //   token: jsonToken,
              //   data: usrDetails,
              // });
            }
          });
        });
      }

      if (results) {
        const result = compareSync(req.body.usrPassword, results.usrPassword);
        if (result) {
          results.password = undefined;
          const jsonToken = sign(
            { result: result },
            process.env.ENCRYPTION_KEY
          );
          return res.json({
            success: true,
            message: "Login successfully",
            token: jsonToken,
            data: results,
          });
        } else {
          return res.json({
            success: false,
            message: "Invalid email or password",
          });
        }
      }

      // return res.json({
      //   success: false,
      //   message: "Something went wrong",
      // });
    });
  },

  forgotPass: (req, res) => {
    getUserByUserEmail(req.params.usrEmail, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.status(404).json({
          success: false,
          message: "No account found. Please register",
        });
      }

      // const email = res.params.usrEmail;
      // const emailPrefix = email.substring(0, indexOf("@"));
      const jsonToken = jwt.sign(
        { result: results },
        process.env.ENCRYPTION_KEY
      );
      passResetUserExists(results.uid, (err, existsResults) => {
        if (err) {
          console.log(err);
          return;
        }

        storeResetToken(results.uid, jsonToken, (err, result) => {
          if (err) {
            console.log(err);
            return;
          }

          if (!result) {
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          return res.json({
            success: true,
            message: "Password reset token sent",
            token: jsonToken,
            validity: "15 minutes",
            usrEmail: results.usrEmail,
            uid: results.uid,
          });
        });
      });
    });
  },

  updateUserPassword: (req, res) => {
    const salt = genSaltSync(10);
    req.body.usrPassword = hashSync(req.body.usrPassword, salt);
    checkPassResetTokenAndTime(
      req.body.resetToken,
      (checkResetTokenTimeError, checkResetTokenTimeResults) => {
        if (checkResetTokenTimeError) {
          console.log(checkResetTokenTimeError);
          return;
        }

        if (!checkResetTokenTimeResults) {
          return res.json({
            success: false,
            message: "No id found",
          });
        }

        updatePassword(
          req.body.usrEmail,
          req.body.usrPassword,
          (error, results) => {
            if (error) {
              console.log(error);
              return;
            }

            if (!results) {
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            getUserByUserEmail(req.body.usrEmail, (err, userDetails) => {
              if (err) {
                console.log(err);
                return;
              }

              if (!userDetails) {
                return res.json({
                  success: false,
                  message: "No records found",
                });
              }

              deleteResetPassToken(
                req.body.uid,
                req.body.resetToken,
                (deleteResetTokenError, deleteResetTokenResults) => {
                  if (deleteResetTokenError) {
                    console.log(deleteResetTokenError);
                    return;
                  }

                  if (!deleteResetTokenResults) {
                    return res.json({
                      success: false,
                      message: "Something went wrong",
                    });
                  }

                  const jsonToken = jwt.sign(
                    { result: userDetails },
                    process.env.ENCRYPTION_KEY
                  );
                  return res.json({
                    success: true,
                    message: "Your password updated successfully",
                    token: jsonToken,
                    data: userDetails,
                  });
                }
              );
            });
          }
        );
      }
    );
  },

  cancelResetPassToken: (req, res) => {
    deleteResetPassToken(
      req.params.uid,
      req.params.resetToken,
      (err, result) => {
        if (err) {
          console.log(err);
          return;
        }

        if (!result) {
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        return res.json({
          success: true,
          message: "Existing id is deleted successfully",
        });
      }
    );
  },

  getUsrTaskRecords: (req, res) => {
    getTaskRecords(req.params.uid, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.status(404).json({
          success: false,
          message: "No resords found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Got your records",
        data: results[0],
      });
    });
  },

  getCompletionRate: (req, res) => {
    getTaskRecords(req.params.uid, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.status(404).json({
          success: false,
          message: "No resords found",
        });
      }

      const taskCount = results[0].taskCount;
      const taskDelete = results[0].taskDelete;
      const taskDone = results[0].taskDone;
      let completionRate = Math.round(
        (taskDone / (taskCount - taskDelete)) * 100
      );

      if (taskCount == 0) {
        completionRate = 0;
      }

      console.log(completionRate);
      return res.status(200).json({
        success: true,
        message: "Got your completion rate",
        completionRate: completionRate,
      });
    });
  },

  resendOTP: (req, res) => {
    resend(req.params.uid, req.params.verificationToken, (error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      if (!result) {
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      const otp = crypto.randomInt(10000000, 99999999);

      updateOTP(body.uid, jsonToken, otp, (otpErr, otpDetails) => {
        if (otpErr) {
          console.error(otpErr);
          return res.json({
            success: false,
            message: "OTP Generation Failed",
          });
        }

        const transporter = nodemailer.createTransport({
          host: "mail.achivie.com",
          port: 465,
          auth: {
            user: "donotreply.verification@achivie.com", // your email address
            pass: "OrFoc(?tS)p9", // your email password
          },
        });

        const mailOptions = {
          from: "donotreply.verification@achivie.com",
          to: body.usrEmail, // user's email address
          subject: "OTP Verification",
          text: `Your OTP is ${otp}. Please enter this otp to the otp verification field correctly to verify your account.`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            return res.json({
              success: false,
              message: "Email sent failed",
            });
          }

          console.log("Email sent: " + info.response);
          return res.status(403).json({
            success: false,
            message: "A new OTP was sent to your email.",
            verificationToken: jsonToken,
            otp: otp,
            emailResID: info.response,
          });
        });
      });
    });
  },
};
