require("dotenv").config();
const e = require("express");
const {
  create,
  getTaskDetails,
  getAllTasks,
  getAllTasksCpecificType,
  getAllTasksSpecificTypeStatus,
  deleteTask,
  doneTask,
  unDoneTask,
  undoTask,
  updateTask,
  getTaskDone,
  getUsrPoints,
  getTaskPersonal,
  getTaskPending,
  getTaskBusiness,
  getTaskCount,
  getTaskDelete,
} = require("./tasks.service");

module.exports = {
  createTask: (req, res) => {
    const body = req.body;
    create(body, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Database connection error",
          data: err,
        });
      }
      return res.json({
        success: true,
        message: "Task added successfully",
        taskID: result,
        notificationID: result,
      });
    });
  },

  getSpecificTaskDetails: (req, res) => {
    getTaskDetails(req.body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: false,
          message: "Resord not found",
        });
      }

      return res.json({
        success: true,
        data: results,
      });
    });
  },

  getAllTasks: (req, res) => {
    getAllTasks(req.params.uid, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: false,
          message: "No tasks found",
        });
      }
      return res.json({
        success: true,
        data: results,
      });
    });
  },

  getAllTasksCpecificTypeOfUser: (req, res) => {
    getAllTasksCpecificType(req.params, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: false,
          message: "No tasks found",
        });
      }

      return res.json({
        success: true,
        data: results,
      });
    });
  },

  getAllTasksSpecificTypeStatusOfUser: (req, res) => {
    getAllTasksSpecificTypeStatus(req.body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: false,
          message: "No tasks found",
        });
      }

      return res.json({
        success: true,
        data: results,
      });
    });
  },

  deleteSpecificTask: (req, res) => {
    deleteTask(req.body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: false,
          message: "No tasks found",
        });
      }

      if (results == null) {
        return res.json({
          success: false,
          message: "No tasks found",
        });
      }
      return res.json({
        success: true,
        message: "Task deleted successfully",
        data: results,
      });
    });
  },

  undoSpecificTask: (req, res) => {
    undoTask(req.body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: false,
          message: "No tasks found",
        });
      }

      if (results == null) {
        return res.json({
          success: false,
          message: "No tasks found",
        });
      }
      return res.json({
        success: true,
        message: "Task undo successfully",
        data: results,
      });
    });
  },

  doneUserTask: (req, res) => {
    doneTask(req.body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: false,
          message: "No task found",
        });
      }

      return res.json({
        success: true,
        message: "Congratulations, you completed this task",
        data: results[0],
      });
    });
  },

  unDoneUserTask: (req, res) => {
    unDoneTask(req.body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: false,
          message: "No task found",
        });
      }

      return res.json({
        success: true,
        message: "This task is successfully un done",
        data: results[0],
      });
    });
  },

  updateSpecificTask: (req, res) => {
    updateTask(req.body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: false,
          message: "No tasks found",
        });
      }

      getTaskDetails(req.body, (error, result) => {
        if (error) {
          console.log(error);
          return;
        }

        if (!result) {
          return res.json({
            success: false,
            message: "No task found",
          });
        }

        return res.json({
          success: true,
          message: "Your task is successfully updated",
          data: results[0],
          details: result[0],
        });
      });
    });
  },

  getUsrTaskDone: (req, res) => {
    let uid = req.params.uid;
    getTaskDone(uid, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!result) {
        return res.json({
          success: false,
          message: "No task found",
        });
      }

      return res.json({
        success: true,
        message: "Got the task details",
        data: result[0],
      });
    });
  },

  getUsrTotalPoints: (req, res) => {
    let uid = req.params.uid;
    getUsrPoints(uid, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!result) {
        return res.json({
          success: false,
          message: "No task found",
        });
      }

      return res.json({
        success: true,
        message: "Got the task details",
        data: result[0],
      });
    });
  },

  getUsrTaskPersonal: (req, res) => {
    let uid = req.params.uid;
    getTaskPersonal(uid, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!result) {
        return res.json({
          success: false,
          message: "No task found",
        });
      }

      return res.json({
        success: true,
        message: "Got the task details",
        data: result[0],
      });
    });
  },

  getUsrTaskPending: (req, res) => {
    let uid = req.params.uid;
    getTaskPending(uid, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!result) {
        return res.json({
          success: false,
          message: "No task found",
        });
      }

      return res.json({
        success: true,
        message: "Got the task details",
        data: result[0],
      });
    });
  },

  getUsrTaskBusiness: (req, res) => {
    let uid = req.params.uid;
    getTaskBusiness(uid, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!result) {
        return res.json({
          success: false,
          message: "No task found",
        });
      }

      return res.json({
        success: true,
        message: "Got the task details",
        data: result[0],
      });
    });
  },

  getUsrTaskCount: (req, res) => {
    let uid = req.params.uid;
    getTaskCount(uid, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!result) {
        return res.json({
          success: false,
          message: "No task found",
        });
      }

      return res.json({
        success: true,
        message: "Got the task details",
        data: result[0],
      });
    });
  },

  getUsrTaskDelete: (req, res) => {
    let uid = req.params.uid;
    getTaskDelete(uid, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!result) {
        return res.json({
          success: false,
          message: "No task found",
        });
      }

      return res.json({
        success: true,
        message: "Got the task details",
        data: result[0],
      });
    });
  },
};
