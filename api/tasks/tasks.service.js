const pool = require("../../config/database");

module.exports = {
  create: (data, callback) => {
    var count;

    pool.query(
      `select taskCount from users where uid=?`,
      [data.uid],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        if (results) {
          count = results[0]["taskCount"] + 1;
          pool.query(
            `insert into tasks(uid, notificationID, taskDate, taskDes, taskName, taskNotification, taskStatus, taskTime, taskType)values(?,?,?,?,?,?,?,?,?)`,
            [
              data.uid,
              count,
              data.taskDate,
              data.taskDes,
              data.taskName,
              data.taskNotification,
              "Pending",
              data.taskTime,
              data.taskType,
            ],
            (error, results, fields) => {
              if (error) {
                return callback(error);
              }
            }
          );

          if (data.taskType == "Personal") {
            pool.query(
              `update users set taskPersonal = taskPersonal + 1 where uid=?`,
              [data.uid],
              (error, results, fields) => {
                if (error) {
                  return callback(error);
                }
              }
            );
          }

          if (data.taskType == "Business") {
            pool.query(
              `update users set taskBusiness = taskBusiness + 1 where uid=?`,
              [data.uid],
              (error, results, fields) => {
                if (error) {
                  return callback(error);
                }
              }
            );
          }

          pool.query(
            `update users set taskCount = ? where uid=?`,
            [count, data.uid],
            (error, results, fields) => {
              if (error) {
                return callback(error);
              }
            }
          );

          pool.query(
            `update users set taskPending = taskPending + 1 where uid=?`,
            [data.uid],
            (error, results, fields) => {
              if (error) {
                return callback(error);
              }
            }
          );

          pool.query(
            `update users set usrPoints = usrPoints + ${data.taskPoints} where uid=?`,
            [data.uid],
            (error, results, fields) => {
              if (error) {
                return callback(error);
              }
            }
          );

          let taskWords =
            "," +
            data.taskName +
            "," +
            data.taskDes +
            "," +
            data.taskNotification +
            "," +
            data.taskType +
            ",";
          const cleanedText = taskWords
            .replace(/[^\w\s,]/g, " ")
            .replace(/(?<!,) +| +(?=,)/g, ",")
            .replace(/\s/g, "");

          pool.query(
            `UPDATE words SET words = CONCAT(words, ?) WHERE uid = ?`,
            [cleanedText, data.uid],
            (error, result, field) => {
              if (error) {
                return callback(error);
              }
            }
          );

          return callback(null, count);
        }
      }
    );
  },

  getTaskDetails: (data, callback) => {
    console.log(typeof data.uid);
    pool.query(
      `select * from tasks where uid='${data.uid}' AND notificationID=?`,
      [data.notificationID],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },

  getAllTasks: (uid, callback) => {
    pool.query(
      `select * from tasks where uid=?`,
      [uid],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }

        return callback(null, results);
      }
    );
  },

  getAllTasksCpecificType: (data, callback) => {
    pool.query(
      `select * from tasks where uid=? and taskType=?`,
      [data.uid, data.taskType],
      (error, results, fields) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },

  // say I have a sql databse of tasks from where I want the tasks which is taskType is business and taskStatus is pending and the uid is re10

  getAllTasksSpecificTypeStatus: (data, callback) => {
    pool.query(
      `select * from tasks where taskType=? and taskStatus=? and uid=?`,
      [data.taskType, data.taskStatus, data.uid],
      (error, result, fields) => {
        console.log(data.uid);
        console.log(data.taskType);
        console.log(data.taskStatus);
        if (error) {
          console.log(error);
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },

  deleteTask: (data, callback) => {
    pool.query(
      `select taskStatus from tasks where uid=? and notificationID=?`,
      [data.uid, data.notificationID],
      (taskStatusError, taskStatusResult, taskStatusField) => {
        console.log(taskStatusResult);
        if (taskStatusError) {
          console.log(taskStatusError);
          return callback(taskStatusError);
        }

        if (taskStatusResult[0]["taskStatus"] == "Deleted") {
          return callback(taskStatusError);
        }

        if (taskStatusResult[0]["taskStatus"] == "Completed") {
          return callback(taskStatusError);
        }

        if (taskStatusResult[0]["taskStatus"] == "Pending") {
          pool.query(
            `update users set taskPending = taskPending - 1 where uid=?`,
            [data.uid],
            (tasPendingError, taskPendingResult, taskPendingField) => {
              if (tasPendingError) {
                console.log(tasPendingError);
                return callback(tasPendingError);
              }
            }
          );
        }

        if (taskStatusResult[0]["taskStatus"] == "Completed") {
          pool.query(
            `update users taskDone = taskDone - 1 where uid=?`,
            [data.uid],
            (taskDoneError, taskDoneResult, taskDoneField) => {
              if (tasPendingError) {
                console.log(taskDoneError);
                return callback(taskDoneError);
              }
            }
          );
        }

        if (taskStatusResult[0]["taskStatus"] != "Deleted") {
          pool.query(
            `update tasks set taskStatus='Deleted' where notificationID=? and uid=?`,
            [data.notificationID, data.uid],
            (error, results, fields) => {
              if (error) {
                console.log(error);
                return callback(error);
              }

              pool.query(
                `select taskType from tasks where uid=? and notificationID=?`,
                [data.uid, data.notificationID],
                (taskTypeError, taskTypeResult, taskType) => {
                  if (taskTypeError) {
                    console.log(taskTypeError);
                    return callback(taskTypeError);
                  }

                  if (taskTypeResult[0]["taskType"] == "Business") {
                    pool.query(
                      `update users set taskBusiness = taskBusiness - 1 where uid=?`,
                      [data.uid],
                      (taskTypeBError, taskTypeBResult, taskTypeBFields) => {
                        if (taskTypeBError) {
                          console.log(taskTypeBError);
                          return callback(taskTypeBError);
                        }
                      }
                    );
                  }

                  if (taskTypeResult[0]["taskType"] == "Personal") {
                    pool.query(
                      `update users set taskPersonal = taskPersonal - 1 where uid=?`,
                      [data.uid],
                      (taskTypePError, taskTypePResult, taskTypePFields) => {
                        if (taskTypePError) {
                          console.log(taskTypePError);
                          return callback(taskTypePError);
                        }
                      }
                    );
                  }
                }
              );
            }
          );

          pool.query(
            `update users set taskDelete = taskDelete + 1 where uid=?`,
            [data.uid],
            (taskDeleteError, taskDeleteResult, taskDeleteField) => {
              if (taskDeleteError) {
                console.log(taskDeleteError);
                return callback(taskDeleteError);
              }
            }
          );

          pool.query(
            `select taskPending, taskDone, usrPoints, taskDelete, taskCount from users where uid=?`,
            [data.uid],
            (error, results, fields) => {
              if (error) {
                console.log(error);
                return callback(error);
              }
              return callback(null, results);
            }
          );
        }
      }
    );
  },

  undoTask: (data, callback) => {
    pool.query(
      `select taskStatus from tasks where uid=? and notificationID=?`,
      [data.uid, data.notificationID],
      (taskStatusError, taskStatusResult, taskStatusField) => {
        if (taskStatusError) {
          console.log(taskStatusError);
          return callback(taskStatusError);
        }

        if (taskStatusResult[0]["taskStatus"] == "Deleted") {
          pool.query(
            `update tasks set taskStatus='Pending' where notificationID=? and uid=?`,
            [data.notificationID, data.uid],
            (error, results, fields) => {
              if (error) {
                console.log(error);
                return callback(error);
              }

              pool.query(
                `select taskType from tasks where uid=? and notificationID=?`,
                [data.uid, data.notificationID],
                (taskTypeError, taskTypeResult, taskType) => {
                  if (taskTypeError) {
                    console.log(taskTypeError);
                    return callback(taskTypeError);
                  }

                  if (taskTypeResult[0]["taskType"] == "Business") {
                    pool.query(
                      `update users set taskBusiness = taskBusiness + 1 where uid=?`,
                      [data.uid],
                      (taskTypeBError, taskTypeBResult, taskTypeBFields) => {
                        if (taskTypeBError) {
                          console.log(taskTypeBError);
                          return callback(taskTypeBError);
                        }
                      }
                    );
                  }

                  if (taskTypeResult[0]["taskType"] == "Personal") {
                    pool.query(
                      `update users set taskPersonal = taskPersonal + 1 where uid=?`,
                      [data.uid],
                      (taskTypePError, taskTypePResult, taskTypePFields) => {
                        if (taskTypePError) {
                          console.log(taskTypePError);
                          return callback(taskTypePError);
                        }
                      }
                    );
                  }
                }
              );
            }
          );

          pool.query(
            `update users set taskDelete = taskDelete - 1 where uid=?`,
            [data.uid],
            (taskDeleteError, taskDeleteResult, taskDeleteField) => {
              if (taskDeleteError) {
                console.log(taskDeleteError);
                return callback(taskDeleteError);
              }
            }
          );

          pool.query(
            `update users set taskPending = taskPending + 1 where uid=?`,
            [data.uid],
            (taskPendingError, taskPendingResult, taskPendingField) => {
              if (tasPendingError) {
                console.log(tasPendingError);
                return callback(tasPendingError);
              }
            }
          );
        }
      }
    );

    pool.query(
      `select taskPending, taskDone, usrPoints, taskDelete, taskCount from users where uid=?`,
      [data.uid],
      (error, results, fields) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },

  doneTask: (data, callback) => {
    pool.query(
      `select taskStatus from tasks where uid=? and notificationID=?`,
      [data.uid, data.notificationID],
      (error, result, field) => {
        if (error) {
          console.log(error);
          return callback(error);
        }

        if (result[0]["taskStatus"] == "Completed") {
          return callback(error);
        }

        if (result[0]["taskStatus"] != "Completed") {
          pool.query(
            `update tasks set taskStatus='Completed' where uid=? and notificationID=?`,
            [data.uid, data.notificationID],
            (error, result, field) => {
              if (error) {
                console.log(error);
                return callback(error);
              }
            }
          );

          pool.query(
            `update users set taskPending=taskPending-1 where uid=?`,
            [data.uid],
            (error, result, field) => {
              if (error) {
                console.log(error);
                return callback(error);
              }
            }
          );

          pool.query(
            `update users set taskDone=taskDone+1 where uid=?`,
            [data.uid],
            (error, result, field) => {
              if (error) {
                console.log(error);
                return callback(error);
              }
            }
          );

          pool.query(
            `select taskPending, taskDone, usrPoints from users where uid=?`,
            [data.uid],
            (error, results, fields) => {
              if (error) {
                console.log(error);
                return callback(error);
              }

              return callback(null, results);
            }
          );
        }
      }
    );
  },

  unDoneTask: (data, callback) => {
    pool.query(
      `select taskStatus from tasks where uid=? and notificationID=?`,
      [data.uid, data.notificationID],
      (error, result, field) => {
        if (error) {
          console.log(error);
          return callback(error);
        }

        if (result[0]["taskStatus"] == "Pending") {
          return callback(error);
        }

        if (result[0]["taskStatus"] != "Pending") {
          pool.query(
            `update tasks set taskStatus='Pending' where uid=? and notificationID=?`,
            [data.uid, data.notificationID],
            (error, result, field) => {
              if (error) {
                console.log(error);
                return callback(error);
              }
            }
          );

          pool.query(
            `update users set taskPending=taskPending+1 where uid=?`,
            [data.uid],
            (error, result, field) => {
              if (error) {
                console.log(error);
                return callback(error);
              }
            }
          );

          pool.query(
            `update users set taskDone=taskDone-1 where uid=?`,
            [data.uid],
            (error, result, field) => {
              if (error) {
                console.log(error);
                return callback(error);
              }
            }
          );

          pool.query(
            `select taskPending, taskDone, usrPoints, taskDelete, taskCount from users where uid=?`,
            [data.uid],
            (error, results, fields) => {
              if (error) {
                console.log(error);
                return callback(error);
              }

              return callback(null, results);
            }
          );
        }
      }
    );
  },

  updateTask: (data, callback) => {
    pool.query(
      `update tasks set taskName=?, taskNotification=?, taskTime=?, taskType=?, taskDes=?, taskDate=?, taskStatus='Pending' where uid=? and notificationID=?`,
      [
        data.taskName,
        data.taskNotification,
        data.taskTime,
        data.taskType,
        data.taskDes,
        data.taskDate,
        data.uid,
        data.notificationID,
      ],
      (error, result, field) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
      }
    );

    let words =
      data.taskName +
      "," +
      data.taskDes +
      "," +
      data.taskNotification +
      "," +
      data.taskType;
    const cleanedText =
      words
        .replace(/[^\w\s,]/g, " ")
        .replace(/(?<!,) +| +(?=,)/g, ",")
        .replace(/\s/g, "") + ",";
    pool.query(
      `UPDATE words SET words = CONCAT(words, ',?') WHERE uid = ?`,
      [cleanedText, data.uid],
      (error, result, field) => {
        if (error) {
          return callback(error);
        }
      }
    );

    // pool.query(
    //     `select * from tasks where uid=? and notificationID=?`,
    //     [data.uid, data.notificationID],
    //     (error, results, fields) => {
    //         if (error)
    //         {
    //             console.log(error);
    //             return callback(error);
    //         }

    //     }
    // )
  },

  getTaskDone: (uid, callback) => {
    pool.query(
      `select taskDone from users where uid=?`,
      [uid],
      (error, result, field) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },

  getUsrPoints: (uid, callback) => {
    pool.query(
      `select usrPoints from users where uid=?`,
      [uid],
      (error, result, field) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },

  getTaskPersonal: (uid, callback) => {
    pool.query(
      `select taskPersonal from users where uid=?`,
      [uid],
      (error, result, field) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },

  getTaskPending: (uid, callback) => {
    pool.query(
      `select taskPending from users where uid=?`,
      [uid],
      (error, result, field) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },

  getTaskBusiness: (uid, callback) => {
    pool.query(
      `select taskBusiness from users where uid=?`,
      [uid],
      (error, result, field) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },

  getTaskCount: (uid, callback) => {
    pool.query(
      `select taskCount from users where uid=?`,
      [uid],
      (error, result, field) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },

  getTaskDelete: (uid, callback) => {
    pool.query(
      `select taskDelete from users where uid=?`,
      [uid],
      (error, result, field) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        return callback(null, result);
      }
    );
  },
};
