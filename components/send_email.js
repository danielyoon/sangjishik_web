const nodemailer = require("nodemailer");

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = process.env.emailFrom }) {
  const transporter = nodemailer.createTransport(process.env.smtpOptions);
  await transporter.sendMail({ from, to, subject, html });
}
