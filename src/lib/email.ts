// src/lib/email.ts
import nodemailer from 'nodemailer';

// SMTP Transporter Create Karein
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Transporter Verify Karein (Connection Check)
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Ready to send emails');
  }
});

// Beautiful OTP Email Template
export function getOTPEmailTemplate(name: string, code: string, year: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account - MineX Pro</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #08080f;
          color: #e2e8f0;
          padding: 40px 20px;
          margin: 0;
          line-height: 1.6;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          background: #111126;
          border-radius: 24px;
          padding: 48px 40px;
          border: 1px solid #222244;
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.9);
        }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 32px; font-weight: 800; color: #10f28c; letter-spacing: -0.5px; }
        .logo span { color: #14c8f5; }
        .logo-sub { color: #475569; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin-top: 4px; display: block; }
        .badge { display: inline-block; background: rgba(16, 242, 140, 0.12); color: #10f28c; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; border: 1px solid rgba(16, 242, 140, 0.15); }
        .greeting { font-size: 18px; font-weight: 600; color: #e2e8f0; margin-bottom: 8px; }
        .greeting span { color: #10f28c; }
        .message { color: #94a3b8; font-size: 15px; margin: 16px 0 24px 0; }
        .code-box { background: #0a0a18; border: 1px solid #1a2a2a; border-radius: 16px; padding: 28px 20px; text-align: center; margin: 24px 0; }
        .code { font-size: 48px; font-weight: 700; color: #10f28c; letter-spacing: 16px; font-family: 'Courier New', monospace; text-shadow: 0 0 40px rgba(16, 242, 140, 0.15); }
        .code-label { color: #475569; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
        .expiry { color: #64748b; font-size: 13px; text-align: center; margin-top: 16px; }
        .expiry strong { color: #10f28c; }
        .divider { border: none; border-top: 1px solid #1a1a2e; margin: 28px 0; }
        .footer { text-align: center; color: #475569; font-size: 12px; }
        .footer a { color: #10f28c; text-decoration: none; }
        .footer-links { display: flex; justify-content: center; gap: 20px; margin-top: 12px; flex-wrap: wrap; }
        .footer-links a { color: #64748b; font-size: 12px; text-decoration: none; }
        .footer-links a:hover { color: #10f28c; }
        .warning { color: #64748b; font-size: 12px; text-align: center; margin-top: 16px; padding: 12px 16px; background: rgba(255, 200, 0, 0.04); border-radius: 12px; border: 1px solid rgba(255, 200, 0, 0.06); }
        @media (max-width: 480px) {
          .container { padding: 32px 20px; }
          .code { font-size: 36px; letter-spacing: 10px; }
          .logo { font-size: 26px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Mine<span>X</span> Pro</div>
          <span class="logo-sub">Cloud Mining Platform</span>
        </div>
        <div style="text-align:center;"><span class="badge">🔐 Secure Verification</span></div>
        <div class="greeting">Hello, <span>${name || 'Miner'}</span> 👋</div>
        <p class="message">Thank you for choosing <strong>MineX Pro</strong>. To complete your registration, please verify your email address by entering the code below.</p>
        <div class="code-box">
          <div class="code-label">Your Verification Code</div>
          <div class="code">${code}</div>
        </div>
        <p class="expiry">⏱️ This code will expire in <strong>10 minutes</strong></p>
        <p class="warning">🔒 If you didn't request this code, please ignore this email.<br>No action is required on your part.</p>
        <hr class="divider">
        <div class="footer">
          <p>© ${year} MineX Pro. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
          </div>
          <p style="margin-top:12px;font-size:11px;color:#3a3a5a;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendOTPEmail(email: string, code: string, name?: string) {
  try {
    const year = new Date().getFullYear();
    const htmlContent = getOTPEmailTemplate(name || 'Miner', code, year);

    const info = await transporter.sendMail({
      from: `"MineX Pro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Your OTP Code - MineX Pro',
      html: htmlContent,
    });

    console.log('✅ OTP email sent to:', email);
    console.log('📧 Message ID:', info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email send error:', error?.message || error);
    return { success: false, error: error?.message || 'Failed to send email' };
  }
}

// Test Function - Connection Check
export async function testEmail() {
  try {
    await transporter.sendMail({
      from: `"MineX Pro" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER || '',
      subject: '✅ Test Email - MineX Pro',
      html: `<h1 style="color:#10f28c;">🎉 SMTP Working!</h1><p>Your email setup is complete. MineX Pro is ready to send OTP emails.</p>`,
    });
    console.log('✅ Test email sent successfully!');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Test email failed:', error?.message || error);
    return { success: false, error: error?.message || 'Test failed' };
  }
}