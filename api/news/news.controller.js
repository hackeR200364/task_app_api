require("dotenv").config();
const e = require("express");
const { create, duplicateBlocCheck, blocDetails } = require("./news.service");

module.exports = {
  createBloc: (req, res) => {
    duplicateBlocCheck(req.body.usrID, (err, resBlocID) => {
      if (err) {
        console.error(err);
        return res.status(404).json({
          success: false,
          message: "Somthing went wrong",
          result: result,
        });
      }

      if (resBlocID) {
        return res.json({
          success: false,
          message: `You already have a bloc with Bloc-ID ${resBlocID.blocID} and Bloc-Name ${resBlocID.blocName}`,
        });
      }

      const timestamp = new Date().getTime();
      // const blocProfile = `https://achivie.com/blocProfile/${req.file.filename}`;
      const blocProfile = `${req.protocol}://${req.hostname}/v1/production/bloc/${req.file.filename}`;

      create(req.body, blocProfile, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(404).json({
            success: false,
            message: "Something went wrong",
          });
        }

        blocDetails(req.body.usrID, result, (err, result) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong to get your bloc details!",
            });
          }

          return res.json({
            success: true,
            message: `Congratulations! The bloc ${req.body.blocName} is created successfully for ${req.body.usrID}`,
            blockID: result,
          });
        });
      });
    });
  },
};
