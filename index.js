require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./api/users/user.router");
const tasksRouter = require("./api/tasks/tasks.router");
// const expressLayouts = require("express-ejs-layouts");
// const WebSocket = require("ws");
// const server = require("http").createServer(app);
// const wss = new WebSocket.Server({});

// app.get("/api", (req, res) => (
//     res.json({
//         success: true,
//         message : "Working...",
//     })
// ));

app.use(express.json());
// app.use(expressLayouts);
// app.set("view engine", "ejs");

app.get("/api_start", (req, res) => {
  return res.json({
    success: true,
    message: "Server is working properly",
  });
});
app.use("/api/users", userRouter);
app.use("/api/tasks", tasksRouter);
app.use("/profile", express.static("profilePics"));

app.listen(process.env.APP_PORT, () => {
  console.log("server up and running", process.env.APP_PORT);
});
