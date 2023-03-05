const { createTask,
    getSpecificTaskDetails,
    getAllTasks,
    getAllTasksCpecificTypeOfUser,
    getAllTasksSpecificTypeStatusOfUser,
    deleteSpecificTask,
    doneUserTask,
    unDoneUserTask,
    undoSpecificTask,
    updateSpecificTask
} = require("./tasks.controller");
const taskRouter = require("express").Router();
const { checkToken } = require("../../auth/token_validation");

taskRouter.post("/createTask", checkToken, createTask);
taskRouter.get("/getTaskDetails", checkToken, getSpecificTaskDetails);
taskRouter.get("/getAllTasks", checkToken, getAllTasks);
taskRouter.get("/getAllTasksSpecificType", checkToken, getAllTasksCpecificTypeOfUser);
taskRouter.get("/getTasksOfTypeStatus", checkToken, getAllTasksSpecificTypeStatusOfUser);
taskRouter.post("/deleteTask", checkToken, deleteSpecificTask);
taskRouter.post("/doneTask", checkToken, doneUserTask);
taskRouter.post("/unDoneTask", checkToken, unDoneUserTask);
taskRouter.post("/undoTask", checkToken, undoSpecificTask);
taskRouter.post("/updateTask", checkToken, updateSpecificTask);

module.exports = taskRouter;