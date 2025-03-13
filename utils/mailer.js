const mailer = require("nodemailer");

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const myemail = mailer.createTransport({
  service: process.env.service,
  host: process.env.host,
  // port: 465,

  port: 465,

  auth: {
    user: process.env.email,
    pass: process.env.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function Sendmail(to, subject, html, many = false) {
  try {
    const mailoption = {
      from: `${process.env.Company} <${process.env.email}>`,
      ...{ bcc: to },
      subject: subject,
      html: html,
    };
    await myemail.sendMail(mailoption);
    return { sent: true };
  } catch (error) {
    console.log(error.message);
    return { error: error.message };
  }
}

const sendOTP = async ({ to, subject, text }) => {
  const mails = {
    from: process.env.email,
    to: to,
    subject: subject,
    text: text,
  };
  return transport.sendMail(mails);
};

module.exports = {
  Sendmail,
  sendOTP,
  generateOtp,
};
