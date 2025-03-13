const bcrypt = require("bcryptjs");
const RegisterModel = require("../model/RegisterModel");
const ForgetPasswordModel = require("../model/ForgetPasswordModel");
const { generateOtp, Sendmail } = require("../utils/mailer");

///registration route//////////////////
const Registration = async (req, res) => {
  // Email regex pattern for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password regex: at least 4 chars, includes a letter & a number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{4,}$/;

  try {
    const Input = req.body;

    if (!Input.Firstname)
      return res
        .status(400)
        .json({ Error: true, Message: "Firstname is required" });
    if (!Input.Lastname)
      return res
        .status(400)
        .json({ Error: true, Message: "Lasttname is required" });
    if (!Input.Email || !emailRegex.test(Input.Email))
      return res
        .status(400)
        .json({ Error: true, Message: "Invalid Email format" });
    if (Input.Password.length < 4)
      return res
        .status(400)
        .json({ Error: true, Message: "Password is short. min of 4" });
    if (!passwordRegex.test(Input.Password))
      return res.status(400).json({
        Error: true,
        Message: "Password must contain at least one letter and one number",
      });
    if (!Input.PhoneNo)
      return res
        .status(400)
        .json({ Error: true, Message: "PhoneNo is required" });

    const existingUser = await RegisterModel.findOne({ Email: Input.Email });
    if (existingUser)
      return res
        .status(400)
        .json({ Error: true, Message: "User already exist with the email" });

    const hashPwd = await bcrypt.hash(Input.Password, 10);
    const user = await RegisterModel.create({
      Firstname: Input.Firstname,
      Lastname: Input.Lastname,
      Email: Input.Email.toLowerCase(),
      Password: hashPwd,
      PhoneNo: Input.PhoneNo,
    });
    res.status(200).json({ Error: false, Message: user });
  } catch (error) {
    console.log("error creating user", error);
    res.status(400).json({ Error: true, Message: "Cannot create user" });
  }
};

/////////////////login route///////////////////
const Login = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password)
      return res
        .status(400)
        .json({ Error: true, Message: "Email and Password is required" });

    const user = await RegisterModel.findOne({ Email: Email.toLowerCase() });
    if (!user)
      return res.status(400).json({ Error: true, Message: "no user found" });

    const validPassword = bcrypt.compareSync(Password, user.Password);
    if (!validPassword)
      return res
        .status(400)
        .json({ Error: true, Message: "Password is incorrect" });

    //save user session
    (req.session.userId = user.id), (req.session.userEmail = user.Email);

    res
      .status(200)
      .json({ Error: false, Message: "Login successfull", User: user });
  } catch (error) {
    console.log("error loggin user", error);
    res.status(400).json({ Error: true, Message: "Cannot login" });
  }
};

//////////////////forget  password route ///////////////////////
const ForgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;
    if (!Email)
      return res
        .status(400)
        .json({ Error: true, Message: "pls provide an email" });

    const user = await RegisterModel.findOne({ Email });
    if (!user) {
      return res
        .status(400)
        .json({ Message: "no user with the email provided" });
    }
    const Otp = generateOtp();

    //save otp to db
    const pwdEntry = new ForgetPasswordModel({
      User_id: user.id,
      Otp: Otp,
    });

    await pwdEntry.save();
    await Sendmail(
      Email,
      " Reset Password Using OTP",
      `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        color: #1eb2a6; /* Updated color */
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                    }
                    .content p {
                        margin: 15px 0;
                        font-size: 16px;
                    }
                    .otp-code {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1eb2a6; /* Updated color */
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 14px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset</h1>
                    </div>
                    <div class="content">
                        <p>Hi there,</p>
                        <p>We received a request to reset your password for your account.</p>
                        <p>If you made this request, use the OTP below to reset your password:</p>
                        <div class="otp-code">${Otp}</div>
                        <p>This OTP will expire in 10 minutes. If you didn’t request this, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Auth App. All Rights Reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            `
    );

    res.status(200).json({ Error: false, Message: "Otp sent to your email" });
  } catch (error) {
    console.log("error processing request", error);
    res.status(400).json({ Error: true, Message: "failed trying" });
  }
};

//////////////Reset Password route//////////////

const ResetPassword = async (req, res) => {
  try {
    // Password regex: at least 4 chars, includes a letter & a number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{4,}$/;

    const { Otp, Password } = req.body;

    // Check if OTP exists in database
    const otpEntry = await ForgetPasswordModel.findOne({ Otp });
    if (!otpEntry) {
      return res.status(400).json({ Error: true, Message: "Invalid OTP" });
    }

    // Validate OTP expiry
    const otpAge = Date.now() - new Date(otpEntry.ExpiresAt).getTime();
    if (otpAge > 10 * 60 * 1000) {
      // 10 minutes
      return res.status(400).json({ Error: true, Message: "OTP expired" });
    }

    // Ensure password length is sufficient
    if (Password.length < 4) {
      return res.status(400).json({
        Message: "Password must be at least 4 characters long",
      });
    }

    if (!passwordRegex.test(Password))
      return res.status(400).json({
        Error: true,
        Message: "Password must contain at least one letter and one number",
      });

    // Hash the new password
    const hashedPwd = bcrypt.hashSync(Password, 10);

    // Update the user’s password in the UserModel
    await RegisterModel.findByIdAndUpdate(otpEntry.User_id, {
      Password: hashedPwd,
    });

    // Delete the OTP entry from `forgetpwd` collection
    await ForgetPasswordModel.deleteOne({ _id: otpEntry._id });

    // Redirect to login page
    res.status(200).json({
      Error: false,
      Message: "Password reset successful. Please log in.",
    });
  } catch (error) {
    console.log("error processing request", error);
    res
      .status(400)
      .json({ Error: true, Message: "failed trying to reset password" });
  }
};

module.exports = {
  Registration,
  Login,
  ForgotPassword,
  ResetPassword,
};
