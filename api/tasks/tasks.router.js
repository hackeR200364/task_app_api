const { createTask,
    getSpecificTaskDetails,
    getAllTasks,
    getAllTasksCpecificTypeOfUser,
    getAllTasksSpecificTypeStatusOfUser,
    deleteSpecificTask,
    doneUserTask,
    unDoneUserTask,
    undoSpecificTask,
    updateSpecificTask,
    getUsrTaskDone,
    getUsrTotalPoints,
    getUsrTaskPersonal,
    getUsrTaskPending,
    getUsrTaskBusiness,
    getUsrTaskCount,
    getUsrTaskDelete
} = require("./tasks.controller");
const taskRouter = require("express").Router();
const { checkToken } = require("../../auth/token_validation");

taskRouter.post("/createTask", checkToken, createTask);
taskRouter.get("/getTaskDetails", checkToken, getSpecificTaskDetails);
taskRouter.get("/getAllTasks/:uid", checkToken, getAllTasks);
taskRouter.get("/getAllTasksSpecificType", checkToken, getAllTasksCpecificTypeOfUser);
taskRouter.get("/getTasksOfTypeStatus", checkToken, getAllTasksSpecificTypeStatusOfUser);
taskRouter.post("/deleteTask", checkToken, deleteSpecificTask);
taskRouter.post("/doneTask", checkToken, doneUserTask);
taskRouter.post("/unDoneTask", checkToken, unDoneUserTask);
taskRouter.post("/undoTask", checkToken, undoSpecificTask);
taskRouter.post("/updateTask", checkToken, updateSpecificTask);
taskRouter.get("/taskDone/:uid", checkToken, getUsrTaskDone);
taskRouter.get("/usrPoints/:uid", checkToken, getUsrTotalPoints);
taskRouter.get("/taskPersonal/:uid", checkToken, getUsrTaskPersonal);
taskRouter.get("/taskPending/:uid", checkToken, getUsrTaskPending);
taskRouter.get("/taskBusiness/:uid", checkToken, getUsrTaskBusiness);
taskRouter.get("/taskCount/:uid", checkToken, getUsrTaskCount);
taskRouter.get("/taskDelete/:uid", checkToken, getUsrTaskDelete);

module.exports = taskRouter;