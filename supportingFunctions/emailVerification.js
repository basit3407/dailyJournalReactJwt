const cryptoRandomString = require("crypto-random-string");
const nodemailer = require("nodemailer");
const Token = require("../models/Token");

const sendEmail = (req, res) => {
  const { name, email } = req.body;
  // generate email Verification token and save
  const token = new Token({
    token: cryptoRandomString({ length: 128 }).toString(),
  });
  token.save((err) => {
    if (err) throw err;
  });
  // Send email
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "basit.prevail@gmail.com,",
      pass: "Pe@14012020",
    },
  });
  const mailOptions = {
    from: "basit.prevail@gmail.com",
    to: email,
    subject: "Account Verification Link",
    text:
      "Hello " +
      name +
      ",\n\n" +
      "Please verify your account by clicking the link: \nhttp://" +
      req.headers.host +
      "/api/users/confirm/" +
      email +
      "/" +
      token.token +
      "\n\nThank You!\n",
  };
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "technical issue,please click on resend" });
    }

    return res.status(200).json({
      success:
        "A verification email has been sent to " +
        email +
        ". It will  expire after one day. If you didn't get verification Email click on resend token.",
    });
  });
};

module.exports = sendEmail;
