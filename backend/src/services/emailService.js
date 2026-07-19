const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async ({ email, resetToken }) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "SplitSense Password Reset",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #0f766e;">Reset Your Password</h2>
        <p>You requested a password reset for your SplitSense account.</p>
        <p>Click the button below to choose a new password:</p>
        <a href="${resetLink}" style="display:inline-block;background:#0d9488;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
        <p style="color:#64748b;font-size:14px;">This link expires in 1 hour.</p>
      </div>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
};
