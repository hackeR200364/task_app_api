require("dotenv").config();
const { create, getUserByUserEmail, getUserByUserID,  } = require("../users/user.service");

const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");

module.exports = {
    createUser: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.usrPassword = hashSync(body.usrPassword, salt);
        create(body, (err, result) => {
            if(err)
            {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: "Database connection error",
                });
            }

            const jsonToken = sign({ result: result }, process.env.ENCRYPTION_KEY);
            
            getUserByUserID(body.uid, (err, results) => {

                if(err) 
                {
                    console.log(err);
                    return;
                }
    
                if(!results)
                {
                    return res.json({
                        success: 0,
                        message: "Record not found"
                    });
                    
                }
    
                return res.json({
                    success: 1,
                    message: "Registration successful",
                    token:jsonToken,
                    data: results,
                });
            });
        });
    },
    
    login: (req, res) => {
        const body = req.body;
        getUserByUserEmail(body.usrEmail, (err, results) => {
            if(err)
            {
                console.log(err);
            }
            if(!results)
            {
                return res.json({
                    success: false,
                    message: "Invalid email or password not results"
                });
            }
            const result = compareSync(body.usrPassword, results.usrPassword);
            if(result)
            {
                results.password = undefined;
                const jsonToken = sign({result: result}, process.env.ENCRYPTION_KEY);
                return res.json({
                    success: true,
                    message: "Login successfully",
                    token: jsonToken,
                });
            }
            else
            {
                return res.json({
                    success: false,
                    message: "Invalid email or password"
                })
            }
        });
    },
}