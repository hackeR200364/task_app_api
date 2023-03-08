require("dotenv").config();
const {
  create,
  getUserByUserEmail,
  getUserByUserID,
} = require("../users/user.service");

const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");

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
              return res.json({
                success: true,
                message: "Registration successful",
                token: jsonToken,
                data: usrDetails,
              });
            }
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
};
