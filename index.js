require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./api/users/user.router");
const tasksRouter = require("./api/tasks/tasks.router");

// app.get("/api", (req, res) => (
//     res.json({
//         success: true,
//         message : "Working...",
//     })
// ));

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/tasks", tasksRouter);

app.listen(process.env.APP_PORT, () => {
  console.log("server up and running", process.env.APP_PORT);
});
