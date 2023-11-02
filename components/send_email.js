const nodemailer = require("nodemailer");

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM }) {
  const transporter = nodemailer.createTransport(process.env.SMTP_OPTIONS);
  await transporter.sendMail({ from, to, subject, html });
}
