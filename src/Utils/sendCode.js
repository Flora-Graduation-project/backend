import nodemailer from "nodemailer";

export const sendCodeEmail = async ({
  toEmail,
  code,
  subject = "Your Verification Code",
  messageBody,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_EMAIL_PASSWORD,
    },
  });

  const htmlMessage = `
    <div style="font-family: Arial; padding: 20px; border-radius: 10px; background: #f8f8f8;">
      <h2 style="color:#333;">${subject}</h2>
      <p style="font-size: 16px;">${messageBody}</p>
      <h1 style="color:#1E90FF; text-align:center; letter-spacing:5px;">${code}</h1>
      <p style="font-size: 14px; color: #555;">
        This code is valid for 5 minutes. If you didn't request this, ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `Flora App <${process.env.APP_EMAIL}>`,
    to: toEmail,
    subject,
    html: htmlMessage,
  });
};
