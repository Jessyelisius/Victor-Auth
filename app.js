const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const connection = require("./config/dbConn");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
connection();

//midleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view-engine", "ejs");
app.use(
  session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }, ///1hr session
  })
);

app.use("/auth", require("./routes/user"));
app.use("/", require("./routes/home"));

app.listen(port, () => console.log(`app listening on port ${port}!`));
