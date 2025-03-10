const nodemailer = require("nodemailer");
const { passwordResetTemplate } = require("../template/mail/resetToken");
module.exports = class Email {
  constructor(user, url = "") {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = `Money hunter <${process.env.EMAIL_USER}>`;
    this.url = url;
  }
  newTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async sendPasswordResetToken() {
    const reponse = passwordResetTemplate(this.firstName, this.url);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: this.to,
      subject: "Password Reset Request",
      html: reponse,
    };

    await this.newTransport().sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });
  }
};
