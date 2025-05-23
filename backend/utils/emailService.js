const nodemailer = require("nodemailer");
const { passwordResetTemplate } = require("../template/mail/resetToken");

class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = `Edusphere <${process.env.EMAIL_USER}>`;
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

  async sendPasswordResetToken(url) {
    const htmlContent = passwordResetTemplate(this.firstName, url);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: "Password Reset Request",
      html: htmlContent,
    };

    try {
      const info = await this.newTransport().sendMail(mailOptions);
      console.log("Password reset email sent:", info.response);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  }

  async sendRejetAcceptationEmail(subject, text) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text,
    };

    try {
      const info = await this.newTransport().sendMail(mailOptions);
      console.log("Email sent:", info.response);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  }
}

module.exports = Email;
