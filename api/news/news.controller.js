require("dotenv").config();
const {
  create,
  duplicateBlocCheck,
  blocDetails,
  newsPost,
  newsCountIncrease,
  newsDetails,
} = require("./news.service");

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

  postReport: (req, res) => {
    const files = req.files.reportImages;
    const downloadLinks = [];
    const baseURL = `${req.protocol}://${req.hostname}/v1/production/news`;
    const thumbImageLinkString = `${baseURL}/${req.files.reportTumbImage[0].filename}`;
    let fileName;
    let reportPicLink;

    files.forEach((file) => {
      fileName = file.filename;
      reportPicLink = `${baseURL}/${fileName}`;
      downloadLinks.push(reportPicLink);
      // console.log(fileName);
    });

    const downloadLinksString = downloadLinks.join(",");
    // console.log();

    newsPost(
      req.body,
      downloadLinksString,
      thumbImageLinkString,
      (err, result) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        // console.log(downloadLinksString.split(","));
        console.log(result);

        newsCountIncrease(req.body.reportUsrID, (err, result) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }
          return res.json({
            success: true,
            message: "Your report is successfully posted",
          });
        });
      }
    );
  },

  reportAllDetails: (req, res) => {
    newsDetails(req.params.usrID, req.params.reportUsrID, (err, reportRes) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      if (!reportRes) {
        return res.status(404).json({
          success: false,
          message: "Not found any report",
        });
      }
      reportRes[0].reportImages = reportRes[0].reportImages.split(",");
      console.log(reportRes[0].reportImages);
      return res.json({
        success: true,
        message: "Got the report",
        data: reportRes[0],
      });
    });
  },
};
