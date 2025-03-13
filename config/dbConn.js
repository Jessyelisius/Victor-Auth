const mongoose = require("mongoose");

const connection = async () => {
  try {
    const dbconnection = await mongoose.connect(process.env.database_conn);
    console.log("connection established successful");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connection;
