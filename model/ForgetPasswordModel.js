const mongoose = require("mongoose");

const ForgetPwdSchema = new mongoose.Schema({
  User_id: {
    type: String,
    required: true,
  },
  Otp: {
    type: Number,
    required: true,
    // Unique:true
  },
}, {timestamps:true});

module.exports = mongoose.model("ForgetPassword", ForgetPwdSchema);
