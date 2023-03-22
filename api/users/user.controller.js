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
} = require("../users/user.service");

const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

module.exports = {
  createUser: (req, res) => {
    const body = req.body;
    const salt = genSaltSync(10);
    body.usrPassword = hashSync(body.usrPassword, salt);

    getUserByUserEmail(body.usrEmail, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Database connection error",
        });
      }

      if (!results) {
        create(body, (err, result) => {
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

          const profilePictureUrl = `${req.protocol}://${req.hostname}/profile/${req.file.filename}`;

          updateProfilePicture(profilePictureUrl, body.uid, (err, result) => {
            if (err) {
              console.log(err);
              return;
            }

            if (!result) {
              return res.json({
                success: false,
                message: "Something wenrt wrong",
              });
            }

            getUserByUserID(body.uid, (usrDetailErr, usrDetails) => {
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
                fs.mkdir(`profiles/${req.body.uid}`, (err) => {
                  if (err) throw err;
                  console.log(
                    `Folder created successfully with name ${req.body.uid}`
                  );
                });

                return res.json({
                  success: true,
                  message: "Registration successful",
                  token: jsonToken,
                  data: usrDetails,
                });
              }
            });
          });
        });
      }

      if (results) {
        return res.json({
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
    getUserByUserEmail(body.usrEmail, (err, results) => {
      if (err) {
        console.log(err);
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
        const jsonToken = sign({ result: result }, process.env.ENCRYPTION_KEY);
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
    });
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
      const jsonToken = sign({ result: results }, process.env.ENCRYPTION_KEY);
      passResetUserExists(results.uid, (err, existsResults) => {
        if (err) {
          console.log(err);
          return;
        }

        if (!existsResults[0]) {
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
        }

        if (existsResults[0]) {
          console.log(existsResults);
          return res.json({
            success: false,
            message: "Duplicate id, Please CANCEL it and retry",
          });
        }
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

                  const jsonToken = sign(
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
        data: results,
      });
    });
  },
};
