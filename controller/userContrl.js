const bcrypt = require("bcryptjs");
const RegisterModel = require("../model/RegisterModel");

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
const ForgotPassword = async (req, res) => {};
module.exports = {
  Registration,
  Login,
};
