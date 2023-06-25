require("dotenv").config();
const req = require("express/lib/request");
const {
  create,
  duplicateBlocCheck,
  blocDetails,
  newsPost,
  newsCountIncrease,
  newsDetails,
  reportLikeIncrease,
  likedRecord,
  reportCommentRecord,
  reportCommentIncrease,
  reportCommentRecordList,
  reportCommentsCount,
  reportCommentDelete,
  reportCommentCountDecrease,
  allReportsList,
  allReportsCount,
  allLikedReports,
  allcommentedReports,
  reportLikeDelete,
  reportLikedDeleteDecrease,
  particularReportSave,
  particularReportSaveIncrease,
  particularReportUnSave,
  particularReportUnSaveDecrease,
  followBloc,
  blocFollowerIncrease,
  usrFollowingIncrease,
  unFollowBloc,
  blocFollowerDecrease,
  usrFollowingDecrease,
  particularBlocReportsCount,
  particularBlocTopReports,
  particularUsrLikedReports,
  particularUsrLikedReportsCounts,
  searchingTopReports,
  searchingReportsCount,
  searchingAllReports,
  searchReporters,
  searchReportersCount,
  particularUsrFollowedBloc,
  topReportsCount,
  topReports,
} = require("./news.service");
const res = require("express/lib/response");
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();

function extractHashtags(string) {
  const regex = /#(\w+)/g;
  const hashtags = string.match(regex);
  return hashtags;
}

function calculateRelevance(string, keywords) {
  const stringWords = string.toLowerCase().split(/\s+/);
  const matchedKeywords = keywords.filter((keyword) =>
    stringWords.includes(keyword.toLowerCase())
  );
  const relevanceScore = matchedKeywords.length / keywords.length;
  return relevanceScore;
}

function extractKeywords(string) {
  const tokens = tokenizer.tokenize(string);
  return tokens;
}

function calculateRelevance(string, keywords) {
  const stringWords = string.toLowerCase().split(/\s+/);
  const matchedKeywords = keywords.filter((keyword) =>
    stringWords.includes(keyword.toLowerCase())
  );
  const relevanceScore = matchedKeywords.length / keywords.length;
  return relevanceScore;
}

function calculateReadability(string) {
  const words = string.split(/\s+/);
  const sentences = string.split(/[.!?]+/);

  const wordCount = words.length;
  const sentenceCount = sentences.length - 1;
  const syllableCount = calculateSyllableCount(words);

  const averageWordsPerSentence = wordCount / sentenceCount;
  const averageSyllablesPerWord = syllableCount / wordCount;

  const readabilityScore =
    0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59;

  return readabilityScore.toFixed(2);
}

function calculateSyllableCount(words) {
  let syllableCount = 0;
  const syllableRegex =
    /[^aeiouy][aeiouy]+(?:[^aeiouy]$|[^aeiouy](?=[^aeiouy]))?/gi;

  for (const word of words) {
    const matches = word.match(syllableRegex);
    syllableCount += matches ? matches.length : 0;
  }

  return syllableCount;
}

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
    newsDetails(
      req.params.reportUsrID,
      req.params.reportID,
      (err, reportRes) => {
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

        allLikedReports(req.params.usrID, (err, likedReportsList) => {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              message: "No liked reports",
            });
          }

          if (likedReportsList.length < 1) {
            return res.json({
              success: true,
              detaiils: reportRes[0],
            });
          }

          console.log(likedReportsList);

          // const likedRecordSet = new Set(
          //   likedReportsList.map((record) => record.reportID)
          // );

          const likedRecordSet = new Set(
            likedReportsList
              .map((record) => record.reportID)
              .filter(
                (reportID, index, self) => self.indexOf(reportID) === index
              )
          );

          console.error(likedRecordSet);

          const liked = likedRecordSet.has(req.params.reportID);

          // const reportsWithLikedStatus = reportsList.map((report) => {
          //   const liked = likedRecordSet.has(report.reportID);
          //   return { ...report, liked: liked };
          // });

          allcommentedReports(req.params.usrID, (err, commentedReportsList) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            if (commentedReportsList.length < 1) {
              return res.json({
                success: true,
                liked: liked,
                detaiils: reportRes[0],
              });
            }

            const commentedRecordSet = new Set(
              commentedReportsList.map((record) => record.reportID)
            );

            const commented = commentedRecordSet.has(req.params.reportID);

            // const reportsWithCommentedStatus = reportsWithLikedStatus.map(
            //   (report) => {
            //     const commented = commentedRecordSet.has(report.reportID);
            //     return { ...report, commented: commented };
            //   }
            // );

            particularUsrFollowedBloc(
              req.params.usrID,
              (err, followedBlocs) => {
                if (err) {
                  console.error(err);
                  return res.json({
                    success: false,
                    message: "Something went wrong ",
                  });
                }

                if (followedBlocs.length < 1) {
                  return res.json({
                    success: true,
                    liked: liked,
                    commented: commented,
                    detaiils: reportRes[0],
                  });
                }

                const followedRecordSet = new Set(
                  followedBlocs.map((record) => record.blocID)
                );

                // console.error(reportRes);

                const followed = followedRecordSet.has(reportRes[0].blocID);

                // const reportersWithFollowedStatus =
                //   reportsWithCommentedStatus.map((report) => {
                //     const followed = followedRecordSet.has(report.blocID);
                //     return { ...report, followed: followed };
                //   });

                reportRes[0].reportImages =
                  reportRes[0].reportImages.split(",");
                return res.json({
                  success: true,
                  message: "Got the report",
                  liked: liked,
                  commented: commented,
                  followed: followed,
                  detaiils: reportRes[0],
                });
              }
            );
          });
        });

        // reportRes[0].reportImages = reportRes[0].reportImages.split(",");
        // console.log(reportRes[0].reportImages);
        // return res.json({
        //   success: true,
        //   message: "Got the report",
        //   data: reportRes[0],
        // });
      }
    );
  },

  particularReportLike: (req, res) => {
    reportLikeIncrease(
      req.params.usrID,
      req.params.reportID,
      (err, reportRes) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        likedRecord(
          req.params.reportID,
          req.params.usrID,
          req.params.blocID,
          (err, reportRes) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }
            return res.json({
              success: true,
              message: "Liked",
              liked: true,
            });
          }
        );
      }
    );
  },

  particularReportCommentPost: (req, res) => {
    reportCommentRecord(
      req.body.reportID,
      req.body.toUsrID,
      req.body.toBlocID,
      req.body.fromUsrID,
      req.body.comment,
      (err, reportRes) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        reportCommentIncrease(
          req.body.usrID,
          req.body.reportID,
          (err, reportRes) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            return res.json({
              success: true,
              message: "Comment Published",
            });
          }
        );
      }
    );
  },

  commentList: (req, res) => {
    const offset = (req.query.page - 1) * req.query.limit;
    reportCommentRecordList(
      offset,
      req.query.limit,
      req.params.reportID,
      (err, comments) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }
        if (comments.length < 1) {
          return res.json({
            success: false,
            message: "No more comments",
          });
        }

        reportCommentsCount(req.params.reportID, (err, commentsRecordCount) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          const totalPage = Math.ceil(
            +commentsRecordCount[0]?.count / req.query.limit
          );

          return res.json({
            success: true,
            message: "Got the comments",
            totalPage: totalPage,
            comments: comments,
          });
        });
      }
    );
  },

  particularReportCommentDelete: (req, res) => {
    reportCommentDelete(req.params.commentID, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      reportCommentCountDecrease(req.params.reportID, (err, result) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        return res.json({
          success: true,
          message: "Your comment was deleted",
        });
      });
    });
  },

  allReports: (req, res) => {
    const offset = (req.query.page - 1) * req.query.limit;

    allReportsCount((err, reportCount) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      const totalPage = Math.ceil(+reportCount[0]?.count / req.query.limit);

      allReportsList(offset, req.query.limit, (err, reportsList) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "No reports",
          });
        }

        if (reportsList.length < 1) {
          return res.json({
            success: false,
            message: "No more reports",
          });
        }

        allLikedReports(req.params.usrID, (err, likedReportsList) => {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              message: "No liked reports",
            });
          }

          if (likedReportsList.length < 1) {
            return res.json({
              success: true,
              reports: reportsList,
              totalPage: totalPage,
            });
          }

          // console.log(likedReportsList);

          const likedRecordSet = new Set(
            likedReportsList.map((record) => record.reportID)
          );

          const reportsWithLikedStatus = reportsList.map((report) => {
            const liked = likedRecordSet.has(report.reportID);
            return { ...report, liked: liked };
          });

          allcommentedReports(req.params.usrID, (err, commentedReportsList) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            if (commentedReportsList.length < 1) {
              return res.json({
                success: true,
                reports: reportsWithLikedStatus,
                totalPage: totalPage,
              });
            }

            const commentedRecordSet = new Set(
              commentedReportsList.map((record) => record.reportID)
            );

            const reportsWithCommentedStatus = reportsWithLikedStatus.map(
              (report) => {
                const commented = commentedRecordSet.has(report.reportID);
                return { ...report, commented: commented };
              }
            );

            particularUsrFollowedBloc(
              req.params.usrID,
              (err, followedBlocs) => {
                if (err) {
                  console.error(err);
                  return res.json({
                    success: false,
                    message: "Something went wrong ",
                  });
                }

                if (followedBlocs.length < 1) {
                  return res.json({
                    success: true,
                    totalPage: totalPage,
                    reports: reportsWithCommentedStatus,
                  });
                }

                const followedRecordSet = new Set(
                  followedBlocs.map((record) => record.blocID)
                );

                const reportersWithFollowedStatus =
                  reportsWithCommentedStatus.map((report) => {
                    // console.log(report.reportBlocID);
                    const followed = followedRecordSet.has(report.reportBlocID);
                    return { ...report, followed: followed };
                  });

                return res.json({
                  success: true,
                  message: "Got trending reports",
                  totalPage: totalPage,
                  reports: reportersWithFollowedStatus,
                });
              }
            );
          });
        });
      });
    });
  },

  particularReportLikeDelete: (req, res) => {
    reportLikeDelete(req.params.reportID, req.params.usrID, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      reportLikedDeleteDecrease(req.params.reportID, (err, result) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        return res.json({
          success: true,
          message: "Like deleted",
          liked: false,
        });
      });
    });
  },

  saveReport: (req, res) => {
    particularReportSave(
      req.body.reportID,
      req.body.usrLat,
      req.body.usrLong,
      req.body.toUsrID,
      req.body.fromUsrID,
      req.body.toBlocID,
      (err, result) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        particularReportSaveIncrease(req.body.reportID, (err, result) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          return res.json({
            success: true,
            message: "Successfully saved",
            saved: true,
          });
        });
      }
    );
  },

  unsaveReport: (req, res) => {
    particularReportUnSave(
      req.params.reportID,
      req.params.fromUsrID,
      (err, result) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        particularReportUnSaveDecrease(req.params.reportID, (err, result) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          return res.json({
            success: true,
            message: "Successfully unsaved",
            saved: false,
          });
        });
      }
    );
  },

  followBloc: (req, res) => {
    followBloc(
      req.body.blocID,
      req.body.fromUsrID,
      req.body.followedLat,
      req.body.followedLong,
      req.body.toUsrID,
      (err, result) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        blocFollowerIncrease(req.body.blocID, (err, result) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          usrFollowingIncrease(req.body.fromUsrID, (err, result) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            return res.json({
              success: true,
              message: "Followed",
              followed: true,
            });
          });
        });
      }
    );
  },

  unfollowBloc: (req, res) => {
    unFollowBloc(req.params.blocID, req.params.fromUsrID, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      blocFollowerDecrease(req.params.blocID, (err, result) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        usrFollowingDecrease(req.params.fromUsrID, (err, result) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          return res.json({
            success: true,
            message: "Unfollowed",
            followed: false,
          });
        });
      });
    });
  },

  trendingReports: (req, res) => {
    allReportsCount((err, reportCount) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }
      const totalPage = Math.ceil(+reportCount[0]?.count / req.query.limit);

      if (req.query.page > totalPage) {
        return res.json({
          success: false,
          message: "There are no more reports",
        });
      }
      const offset = (req.query.page - 1) * req.query.limit;

      allReportsList(offset, req.query.limit, (err, reportsList) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        reportsList.sort((reportA, reportB) => {
          const wordsA = reportA.reportHeadline.split(" ").length;
          const wordsB = reportB.reportHeadline.split(" ").length;
          return wordsA - wordsB;
        });

        reportsList.sort((reportA, reportB) => {
          const hashtagsA = extractHashtags(
            reportA.reportHeadline + " " + reportA.reportDes
          );
          const hashtagsB = extractHashtags(
            reportB.reportHeadline + " " + reportB.reportDes
          );
          return hashtagsA - hashtagsB;
        });

        reportsList.sort((reportA, reportB) => {
          const stringA = reportA.reportHeadline + " " + reportA.reportDes;
          const stringB = reportB.reportHeadline + " " + reportB.reportDes;
          const keywordsA = extractKeywords(stringA);
          const keywordsB = extractKeywords(stringB);
          const relevanceScoreA = calculateRelevance(stringA, keywordsA);
          const relevanceScoreB = calculateRelevance(stringB, keywordsB);
          return relevanceScoreA - relevanceScoreB;
        });

        reportsList.sort((reportA, reportB) => {
          const readabilityScoreScoreA = calculateReadability(
            reportA.reportHeadline + " " + reportA.reportDes
          );
          const readabilityScoreScoreB = calculateReadability(
            reportB.reportHeadline + " " + reportB.reportDes
          );
          return readabilityScoreScoreA - readabilityScoreScoreB;
        });

        allLikedReports(req.params.usrID, (err, likedReportsList) => {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              message: "No liked reports",
            });
          }

          if (likedReportsList.length < 1) {
            return res.json({
              success: true,
              reports: reportsList,
              totalPage: totalPage,
            });
          }

          console.log(likedReportsList);

          const likedRecordSet = new Set(
            likedReportsList.map((record) => record.reportID)
          );

          const reportsWithLikedStatus = reportsList.map((report) => {
            const liked = likedRecordSet.has(report.reportID);
            return { ...report, liked: liked };
          });

          allcommentedReports(req.params.usrID, (err, commentedReportsList) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            if (commentedReportsList.length < 1) {
              return res.json({
                success: true,
                reports: reportsWithLikedStatus,
                totalPage: totalPage,
              });
            }

            const commentedRecordSet = new Set(
              commentedReportsList.map((record) => record.reportID)
            );

            const reportsWithCommentedStatus = reportsWithLikedStatus.map(
              (report) => {
                const commented = commentedRecordSet.has(report.reportID);
                return { ...report, commented: commented };
              }
            );

            particularUsrFollowedBloc(
              req.params.usrID,
              (err, followedBlocs) => {
                if (err) {
                  console.error(err);
                  return res.json({
                    success: false,
                    message: "Something went wrong ",
                  });
                }

                if (followedBlocs.length < 1) {
                  return res.json({
                    success: true,
                    totalPage: totalPage,
                    reports: reportsWithCommentedStatus,
                  });
                }

                const followedRecordSet = new Set(
                  followedBlocs.map((record) => record.blocID)
                );

                const reportersWithFollowedStatus =
                  reportsWithCommentedStatus.map((report) => {
                    const followed = followedRecordSet.has(report.reportBlocID);
                    return { ...report, followed: followed };
                  });

                return res.json({
                  success: true,
                  message: "Got trending reports",
                  totalPage: totalPage,
                  reports: reportersWithFollowedStatus,
                });
              }
            );
          });
        });
      });
    });
  },

  blocTopReports: (req, res) => {
    particularBlocReportsCount(req.params.blocID, (err, reportCount) => {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      if (reportCount[0].count < 1) {
        return res.json({
          success: false,
          message: "No reports found",
        });
      }

      const totalPage = Math.ceil(+reportCount[0]?.count / req.query.limit);

      if (req.query.page > totalPage) {
        return res.json({
          success: false,
          message: "There are no more reports",
        });
      }

      const offset = (req.query.page - 1) * req.query.limit;

      particularBlocTopReports(
        req.params.blocID,
        offset,
        req.query.limit,
        (err, reportsList) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          allLikedReports(req.params.usrID, (err, likedReportsList) => {
            if (err) {
              console.log(err);
              return res.json({
                success: false,
                message: "No liked reports",
              });
            }

            if (likedReportsList.length < 1) {
              return res.json({
                success: true,
                followed: followed,
                reports: reportsList,
                totalPage: totalPage,
              });
            }

            console.log(likedReportsList);

            const likedRecordSet = new Set(
              likedReportsList.map((record) => record.reportID)
            );

            const reportsWithLikedStatus = reportsList.map((report) => {
              const liked = likedRecordSet.has(report.reportID);
              return { ...report, liked: liked };
            });

            allcommentedReports(
              req.params.usrID,
              (err, commentedReportsList) => {
                if (err) {
                  console.error(err);
                  return res.json({
                    success: false,
                    message: "Something went wrong",
                  });
                }

                if (commentedReportsList.length < 1) {
                  return res.json({
                    success: true,
                    followed: followed,
                    reports: reportsWithLikedStatus,
                    totalPage: totalPage,
                  });
                }

                const commentedRecordSet = new Set(
                  commentedReportsList.map((record) => record.reportID)
                );

                const reportsWithCommentedStatus = reportsWithLikedStatus.map(
                  (report) => {
                    const commented = commentedRecordSet.has(report.reportID);
                    return { ...report, commented: commented };
                  }
                );

                particularUsrFollowedBloc(
                  req.params.usrID,
                  (err, followedBlocs) => {
                    if (err) {
                      console.error(err);
                      return res.json({
                        success: false,
                        message: "Something went wrong ",
                      });
                    }

                    if (followedBlocs.length < 1) {
                      return res.json({
                        success: true,
                        followed: false,
                        totalPage: totalPage,
                        reports: reportsWithCommentedStatus,
                      });
                    }

                    const followedRecordSet = new Set(
                      followedBlocs.map((record) => record.blocID)
                    );

                    // console.log(reportsList[0].reportBlocID);

                    const followed = followedRecordSet.has(reportsList[0].reportBlocID);

                    // const reportersWithFollowedStatus =
                    //   reportsWithCommentedStatus.map((report) => {
                    //     const followed = followedRecordSet.has(report.blocID);
                    //     return { ...report, followed: followed };
                    //   });

                    return res.json({
                      success: true,
                      followed: followed,
                      message: "Got trending reports",
                      totalPage: totalPage,
                      reports: reportsWithCommentedStatus,
                    });
                  }
                );
              }
            );
          });

          // return res.json({
          //   success: true,
          //   message: "Got your reports",
          //   totalPage: totalPage,
          //   reports: reports,
          // });
        }
      );
    });
  },

  blocReports: (req, res) => {
    particularBlocReportsCount(req.params.blocID, (err, reportCount) => {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      if (reportCount[0].count < 1) {
        return res.json({
          success: false,
          message: "No reports found",
        });
      }

      const totalPage = Math.ceil(+reportCount[0]?.count / req.query.limit);

      if (req.query.page > totalPage) {
        return res.json({
          success: false,
          message: "There are no more reports",
        });
      }

      const offset = (req.query.page - 1) * req.query.limit;

      particularBlocTopReports(
        req.params.blocID,
        offset,
        req.query.limit,
        (err, reportsList) => {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: "Something went wrong",
            });
          }

          allLikedReports(req.params.usrID, (err, likedReportsList) => {
            if (err) {
              console.log(err);
              return res.json({
                success: false,
                message: "No liked reports",
              });
            }

            if (likedReportsList.length < 1) {
              return res.json({
                success: true,
                followed: false,
                reports: reportsList,
                totalPage: totalPage,
              });
            }

            console.log(likedReportsList);

            const likedRecordSet = new Set(
              likedReportsList.map((record) => record.reportID)
            );

            const reportsWithLikedStatus = reportsList.map((report) => {
              const liked = likedRecordSet.has(report.reportID);
              return { ...report, liked: liked };
            });

            allcommentedReports(
              req.params.usrID,
              (err, commentedReportsList) => {
                if (err) {
                  console.error(err);
                  return res.json({
                    success: false,
                    message: "Something went wrong",
                  });
                }

                if (commentedReportsList.length < 1) {
                  return res.json({
                    success: true,
                    followed: false,
                    reports: reportsWithLikedStatus,
                    totalPage: totalPage,
                  });
                }

                const commentedRecordSet = new Set(
                  commentedReportsList.map((record) => record.reportID)
                );

                const reportsWithCommentedStatus = reportsWithLikedStatus.map(
                  (report) => {
                    const commented = commentedRecordSet.has(report.reportID);
                    return { ...report, commented: commented };
                  }
                );

                particularUsrFollowedBloc(
                  req.params.usrID,
                  (err, followedBlocs) => {
                    if (err) {
                      console.error(err);
                      return res.json({
                        success: false,
                        message: "Something went wrong ",
                      });
                    }

                    if (followedBlocs.length < 1) {
                      return res.json({
                        success: true,
                        followed: false,
                        totalPage: totalPage,
                        reports: reportsWithCommentedStatus,
                      });
                    }

                    const followedRecordSet = new Set(
                      followedBlocs.map((record) => record.fromUsrID)
                    );

                    const followed = followedRecordSet.has(reportsList.blocID);

                    // const reportersWithFollowedStatus =
                    //   reportsWithCommentedStatus.map((report) => {
                    //     const followed = followedRecordSet.has(report.blocID);
                    //     return { ...report, followed: followed };
                    //   });

                    return res.json({
                      success: true,
                      followed: followed,
                      message: "Got trending reports",
                      totalPage: totalPage,
                      reports: reportsWithCommentedStatus,
                    });
                  }
                );
              }
            );
          });
        }
      );
    });
  },

  likedReportsByUsr: (req, res) => {
    particularUsrLikedReportsCounts(
      req.params.likedByUsrID,
      (err, reportCount) => {
        if (err) {
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        if (reportCount[0].count < 1) {
          return res.json({
            success: false,
            message: "No liked reports found",
          });
        }

        const totalPage = Math.ceil(+reportCount[0]?.count / req.query.limit);

        if (req.query.page > totalPage) {
          return res.json({
            success: false,
            message: "There are no more reports",
          });
        }

        const offset = (req.query.page - 1) * req.query.limit;

        particularUsrLikedReports(
          req.params.likedByUsrID,
          offset,
          req.query.limit,
          (err, likedReports) => {
            if (err) {
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            allcommentedReports(
              req.params.likedByUsrID,
              (err, commentedReportsList) => {
                if (err) {
                  console.error(err);
                  return res.json({
                    success: false,
                    message: "Something went wrong",
                  });
                }

                if (commentedReportsList.length < 1) {
                  return res.json({
                    success: true,
                    totalPage: totalPage,
                    reports: likedReports,
                  });
                }

                const commentedRecordSet = new Set(
                  commentedReportsList.map((record) => record.reportID)
                );

                const reportsWithCommentedStatus = likedReports.map(
                  (report) => {
                    const commented = commentedRecordSet.has(report.reportID);
                    return { ...report, commented: commented };
                  }
                );

                particularUsrFollowedBloc(
                  req.params.likedByUsrID,
                  (err, followedBlocs) => {
                    if (err) {
                      console.error(err);
                      return res.json({
                        success: false,
                        message: "Something went wrong ",
                      });
                    }

                    console.error(followedBlocs.length);
                    if (followedBlocs.length < 1) {
                      return res.json({
                        success: true,
                        totalPage: totalPage,
                        reports: reportsWithCommentedStatus,
                      });
                    }

                    const followedRecordSet = new Set(
                      followedBlocs.map((record) => record.blocID)
                    );

                    const reportersWithFollowedStatus =
                      reportsWithCommentedStatus.map((report) => {
                        const followed = followedRecordSet.has(report.reportBlocID);
                        return { ...report, followed: followed };
                      });

                    return res.json({
                      success: true,
                      message: "Got trending reports",
                      totalPage: totalPage,
                      reports: reportersWithFollowedStatus,
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  },

  particularBlocDetails: (req, res) => {
    blocDetails(req.params.usrID, req.params.blocID, (err, details) => {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong",
        });
      }

      particularUsrFollowedBloc(req.params.fromUsrID, (err, followedBlocs) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong ",
          });
        }

        if (followedBlocs.length < 1) {
          return res.json({
            success: true,
            followed: false,
            details: details,
          });
        }

        const followedRecordSet = new Set(
          followedBlocs.map((record) => record.blocID)
        );

        // console.error(followedRecordSet.length);

        const followed = followedRecordSet.has(req.params.blocID);

        // const reportersWithFollowedStatus =
        //   reportsWithCommentedStatus.map((report) => {
        //     const followed = followedRecordSet.has(report.blocID);
        //     return { ...report, followed: followed };
        //   });

        return res.json({
          success: true,
          followed: followed,
          message: "Got trending reports",
          details: details,
        });
      });
    });
  },

  topReportsSearch: (req, res) => {
    searchingReportsCount(
      req.query.q.replace(/\+/g, " "),
      (err, reportsCount) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong ",
          });
        }

        if (reportsCount[0].reportsCount < 1) {
          return res.json({
            success: false,
            message: "No liked reports found",
          });
        }

        const totalPage = Math.ceil(
          +reportsCount[0]?.reportsCount / req.query.limit
        );

        if (req.query.page > totalPage) {
          return res.json({
            success: false,
            message: "There are no more reports",
          });
        }

        const offset = (req.query.page - 1) * req.query.limit;

        searchingTopReports(
          req.query.q.replace(/\+/g, " "),
          req.query.limit,
          offset,
          (err, reports) => {
            if (err) {
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            allLikedReports(req.params.usrID, (err, likedReportsList) => {
              if (err) {
                console.log(err);
                return res.json({
                  success: false,
                  message: "No liked reports",
                });
              }

              if (likedReportsList.length < 1) {
                return res.json({
                  success: true,
                  totalPage: totalPage,
                  reports: reports,
                });
              }

              const likedRecordSet = new Set(
                likedReportsList.map((record) => record.reportID)
              );

              const reportsWithLikedStatus = reports.map((report) => {
                const liked = likedRecordSet.has(report.reportID);
                return { ...report, liked: liked };
              });

              allcommentedReports(
                req.params.usrID,
                (err, commentedReportsList) => {
                  if (err) {
                    console.error(err);
                    return res.json({
                      success: false,
                      message: "Something went wrong",
                    });
                  }

                  if (commentedReportsList.length < 1) {
                    return res.json({
                      success: true,
                      totalPage: totalPage,
                      reports: reportsWithLikedStatus,
                    });
                  }

                  const commentedRecordSet = new Set(
                    commentedReportsList.map((record) => record.reportID)
                  );

                  const reportsWithCommentedStatus = reportsWithLikedStatus.map(
                    (report) => {
                      const commented = commentedRecordSet.has(report.reportID);
                      return { ...report, commented: commented };
                    }
                  );

                  particularUsrFollowedBloc(
                    req.params.usrID,
                    (err, followedBlocs) => {
                      if (err) {
                        console.error(err);
                        return res.json({
                          success: false,
                          message: "Something went wrong ",
                        });
                      }

                      console.error(followedBlocs.length);
                      if (followedBlocs.length < 1) {
                        return res.json({
                          success: true,
                          totalPage: totalPage,
                          reports: reportsWithCommentedStatus,
                        });
                      }

                      const followedRecordSet = new Set(
                        followedBlocs.map((record) => record.blocID)
                      );

                      const reportersWithFollowedStatus =
                        reportsWithCommentedStatus.map((report) => {
                          const followed = followedRecordSet.has(
                            report.reportBlocID
                          );
                          return { ...report, followed: followed };
                        });

                      return res.json({
                        success: true,
                        message: "Got trending reports",
                        totalPage: totalPage,
                        reports: reportersWithFollowedStatus,
                      });
                    }
                  );
                }
              );
            });
          }
        );
      }
    );
  },

  allReportsSearch: (req, res) => {
    searchingReportsCount(
      req.query.q.replace(/\+/g, " "),
      (err, reportsCount) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong ",
          });
        }

        if (reportsCount[0].reportsCount < 1) {
          return res.json({
            success: false,
            message: "No liked reports found",
          });
        }

        const totalPage = Math.ceil(
          +reportsCount[0]?.reportsCount / req.query.limit
        );

        if (req.query.page > totalPage) {
          return res.json({
            success: false,
            message: "There are no more reports",
          });
        }

        const offset = (req.query.page - 1) * req.query.limit;

        searchingAllReports(
          req.query.q.replace(/\+/g, " "),
          req.query.limit,
          offset,
          (err, reports) => {
            if (err) {
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            allLikedReports(req.params.usrID, (err, likedReportsList) => {
              if (err) {
                console.log(err);
                return res.json({
                  success: false,
                  message: "No liked reports",
                });
              }

              if (likedReportsList.length < 1) {
                return res.json({
                  success: true,
                  totalPage: totalPage,
                  reports: reports,
                });
              }

              const likedRecordSet = new Set(
                likedReportsList.map((record) => record.reportID)
              );

              const reportsWithLikedStatus = reports.map((report) => {
                const liked = likedRecordSet.has(report.reportID);
                return { ...report, liked: liked };
              });

              allcommentedReports(
                req.params.usrID,
                (err, commentedReportsList) => {
                  if (err) {
                    console.error(err);
                    return res.json({
                      success: false,
                      message: "Something went wrong",
                    });
                  }

                  if (commentedReportsList.length < 1) {
                    return res.json({
                      success: true,
                      totalPage: totalPage,
                      reports: reportsWithLikedStatus,
                    });
                  }

                  const commentedRecordSet = new Set(
                    commentedReportsList.map((record) => record.reportID)
                  );

                  const reportsWithCommentedStatus = reportsWithLikedStatus.map(
                    (report) => {
                      const commented = commentedRecordSet.has(report.reportID);
                      return { ...report, commented: commented };
                    }
                  );

                  particularUsrFollowedBloc(
                    req.params.usrID,
                    (err, followedBlocs) => {
                      if (err) {
                        console.error(err);
                        return res.json({
                          success: false,
                          message: "Something went wrong ",
                        });
                      }

                      console.error(followedBlocs.length);
                      if (followedBlocs.length < 1) {
                        return res.json({
                          success: true,
                          totalPage: totalPage,
                          reports: reportsWithCommentedStatus,
                        });
                      }

                      const followedRecordSet = new Set(
                        followedBlocs.map((record) => record.blocID)
                      );

                      const reportersWithFollowedStatus =
                        reportsWithCommentedStatus.map((report) => {
                          const followed = followedRecordSet.has(report.reportBlocID);
                          return { ...report, followed: followed };
                        });

                      return res.json({
                        success: true,
                        message: "Got trending reports",
                        totalPage: totalPage,
                        reports: reportersWithFollowedStatus,
                      });
                    }
                  );
                }
              );
            });
          }
        );
      }
    );
  },

  topReports: (req, res) => {
    topReportsCount((err, reportsCount) => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "Something went wrong ",
        });
      }

      if (reportsCount[0].reportsCount < 1) {
        return res.json({
          success: false,
          message: "No liked reports found",
        });
      }

      const totalPage = Math.ceil(
        +reportsCount[0]?.reportCount / req.query.limit
      );

      if (req.query.page > totalPage) {
        return res.json({
          success: false,
          message: "There are no more reports",
        });
      }

      const offset = (req.query.page - 1) * req.query.limit;

      topReports(req.query.limit, offset, (err, reports) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }

        allLikedReports(req.params.usrID, (err, likedReportsList) => {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              message: "No liked reports",
            });
          }

          if (likedReportsList.length < 1) {
            return res.json({
              success: true,
              totalPage: totalPage,
              reports: reports,
            });
          }

          const likedRecordSet = new Set(
            likedReportsList.map((record) => record.reportID)
          );

          const reportsWithLikedStatus = reports.map((report) => {
            const liked = likedRecordSet.has(report.reportID);
            return { ...report, liked: liked };
          });

          allcommentedReports(req.params.usrID, (err, commentedReportsList) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong",
              });
            }

            if (commentedReportsList.length < 1) {
              return res.json({
                success: true,
                totalPage: totalPage,
                reports: reportsWithLikedStatus,
              });
            }

            const commentedRecordSet = new Set(
              commentedReportsList.map((record) => record.reportID)
            );

            const reportsWithCommentedStatus = reportsWithLikedStatus.map(
              (report) => {
                const commented = commentedRecordSet.has(report.reportID);
                return { ...report, commented: commented };
              }
            );

            particularUsrFollowedBloc(
              req.params.usrID,
              (err, followedBlocs) => {
                if (err) {
                  console.error(err);
                  return res.json({
                    success: false,
                    message: "Something went wrong ",
                  });
                }

                if (followedBlocs.length < 1) {
                  return res.json({
                    success: true,
                    totalPage: totalPage,
                    reports: reportsWithCommentedStatus,
                  });
                }

                const followedRecordSet = new Set(
                  followedBlocs.map((record) => record.blocID)
                );

                const reportersWithFollowedStatus =
                  reportsWithCommentedStatus.map((report) => {
                    const followed = followedRecordSet.has(report.reportBlocID);
                    return { ...report, followed: followed };
                  });

                return res.json({
                  success: true,
                  message: "Got trending reports",
                  totalPage: totalPage,
                  reports: reportersWithFollowedStatus,
                });
              }
            );

            // return res.json({
            //   success: true,
            //   message: "Got trending reports",
            //   totalPage: totalPage,
            //   reports: reportsWithCommentedStatus,
            // });
          });
        });
      });
    });
  },

  reportersSearch: (req, res) => {
    searchReportersCount(
      req.query.q.replace(/\+/g, " "),
      (err, reportersCount) => {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: "Something went wrong ",
          });
        }

        if (reportersCount[0].reportersCount < 1) {
          return res.json({
            success: false,
            message: "No reporters found",
          });
        }

        const totalPage = Math.ceil(
          +reportersCount[0]?.reportersCount / req.query.limit
        );

        if (req.query.page > totalPage) {
          return res.json({
            success: false,
            message: "There are no more reports",
          });
        }

        const offset = (req.query.page - 1) * req.query.limit;

        searchReporters(
          req.query.q.replace(/\+/g, " "),
          req.query.limit,
          offset,
          (err, reporters) => {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: "Something went wrong ",
              });
            }

            particularUsrFollowedBloc(
              req.params.fromUsrID,
              (err, followedBlocs) => {
                if (err) {
                  console.error(err);
                  return res.json({
                    success: false,
                    message: "Something went wrong ",
                  });
                }

                if (followedBlocs.length < 1) {
                  return res.json({
                    success: true,
                    totalPage: totalPage,
                    reports: reporters,
                  });
                }

                const followedRecordSet = new Set(
                  followedBlocs.map((record) => record.blocID)
                );

                const reportersWithFollowedStatus = reporters.map(
                  (reporter) => {
                    const followed = followedRecordSet.has(reporter.blocID);
                    return { ...reporter, followed: followed };
                  }
                );

                return res.json({
                  success: true,
                  message: "Got trending reports",
                  totalPage: totalPage,
                  reports: reportersWithFollowedStatus,
                });
              }
            );
          }
        );
      }
    );
  },
};
