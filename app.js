const express = require("express");
const morgan = require("morgan");
const connection = require("./config/dbConn");
const session = require("express-session");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
connection();

//midleware
app.use(morgan("dev"));
app.use(express.json());
app.set("view-engine", "ejs");
app.use(
  session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

app.use("/auth", require("./routes/user"));

app.listen(port, () => console.log(`app listening on port ${port}!`));
