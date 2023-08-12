require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./api/users/user.router");
const tasksRouter = require("./api/tasks/tasks.router");
const newsRouter = require("./api/news/news.router");
const marketingRouter = require("./api/marketing/marketing.router");
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

app.get("/v1/production/api_start", (req, res) => {
  return res.json({
    success: true,
    message: "Server is working properly in production mode",
  });
});
app.use("/v1/production/api/users", userRouter);
app.use("/v1/production/api/tasks", tasksRouter);
app.use("/v1/production/api/newsBloc", newsRouter);
app.use("/v1/production/api/marketing", marketingRouter);
app.use("/v1/production/profile", express.static("profilePics"));
app.use("/v1/production/bloc", express.static("blocPics"));
app.use("/v1/production/news", express.static("newsPics"));
app.listen(process.env.APP_PORT, () => {
  console.log("server up and running", process.env.APP_PORT);
});
