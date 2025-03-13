const express = require("express");
const morgan = require("morgan");
const connection = require("./config/dbConn");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
connection();

//midleware
app.use(morgan("dev"));

app.listen(port, () => console.log(`app listening on port ${port}!`));
