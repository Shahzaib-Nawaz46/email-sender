const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// HTML escaping helper
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate email template matching exact user reference
function generateEmailContent({ teamName, reviewLinks, signOffName }) {
  const cleanTeamName = teamName ? teamName.trim() : '';
  const cleanSignOff = (signOffName && signOffName.trim()) ? signOffName.trim() : 'Reputation Support Team';

  // Greeting: "Hello Holmes Mill Team," if provided, else "Hello,"
  const htmlGreeting = cleanTeamName
    ? `Hello <strong>${escapeHtml(cleanTeamName)}</strong>,`
    : `Hello,`;

  const textGreeting = cleanTeamName
    ? `Hello ${cleanTeamName},`
    : `Hello,`;

  const validLinks = (reviewLinks || []).filter(l => typeof l === 'string' && l.trim().length > 0);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Reviews Notice</title>
</head>
<body style="margin: 0; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f8fa; color: #202124;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 580px; width: 100%; background: #ffffff; border-radius: 8px; border: 1px solid #e1e4e8; padding: 32px 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); text-align: left;" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <p style="font-size: 16px; margin: 0 0 20px 0; color: #202124; line-height: 1.5;">
                ${htmlGreeting}
              </p>

              <p style="font-size: 15px; line-height: 1.65; margin: 0 0 20px 0; color: #3c4043;">
                We noticed some negative reviews on your Google profile. We can completely remove them for you &mdash; and <strong>you only pay AFTER successful removal</strong> (zero upfront payment).
              </p>

              <p style="font-size: 15px; font-weight: 700; margin: 0 0 10px 0; color: #202124;">
                Review link(s):
              </p>

              <ol style="margin: 0 0 22px 24px; padding: 0; line-height: 1.65;">
                ${validLinks.map(link => `<li style="margin-bottom: 8px; font-size: 14px; word-break: break-all;"><a href="${escapeHtml(link.trim())}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: underline;">${escapeHtml(link.trim())}</a></li>`).join('\n                ')}
              </ol>

              <p style="font-size: 15px; line-height: 1.65; margin: 0 0 26px 0; color: #3c4043;">
                If you'd like us to take care of this for you, simply reply to this email and let us know.
              </p>

              <div style="margin-top: 26px; font-size: 14px; color: #5f6368; line-height: 1.5;">
                Best regards,<br>
                <strong style="font-size: 15px; font-weight: 700; color: #202124; display: inline-block; margin-top: 4px;">${escapeHtml(cleanSignOff)}</strong>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLinks = validLinks.map((l, i) => `${i + 1}. ${l.trim()}`).join('\n');
  const text = `${textGreeting}

We noticed some negative reviews on your Google profile. We can completely remove them for you — and you only pay AFTER successful removal (zero upfront payment).

Review link(s):
${textLinks}

If you'd like us to take care of this for you, simply reply to this email and let us know.

Best regards,
${cleanSignOff}
`;

  return { html, text };
}

// Endpoint to verify Gmail SMTP configuration
app.post('/api/verify-smtp', async (req, res) => {
  try {
    const { user, pass } = req.body;
    if (!user || !pass) {
      return res.status(400).json({
        success: false,
        message: 'Gmail address and App Password are both required.'
      });
    }

    const cleanPass = pass.replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: cleanPass
      }
    });

    await transporter.verify();
    return res.json({
      success: true,
      message: 'Gmail SMTP credentials are valid and ready to send!'
    });
  } catch (error) {
    console.error('SMTP Verification Error:', error);
    let errorHelp = error.message;
    if (error.code === 'EAUTH') {
      errorHelp = 'Authentication failed. Please verify your Gmail address and ensure you are using a 16-character Google App Password (not your normal password).';
    }
    return res.status(401).json({
      success: false,
      message: errorHelp
    });
  }
});

// Endpoint to send the review removal email
app.post('/api/send-email', async (req, res) => {
  try {
    const { smtp, emailData } = req.body;

    if (!smtp || !smtp.user || !smtp.pass) {
      return res.status(400).json({
        success: false,
        message: 'Missing Gmail credentials. Please configure your SMTP settings.'
      });
    }

    if (!emailData || !emailData.to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email address (To) is required.'
      });
    }

    const reviewLinks = Array.isArray(emailData.reviewLinks)
      ? emailData.reviewLinks.filter(l => typeof l === 'string' && l.trim().length > 0)
      : [];

    if (reviewLinks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one review link.'
      });
    }

    const cleanPass = smtp.pass.replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtp.user.trim(),
        pass: cleanPass
      }
    });

    const senderDisplayName = (smtp.senderName && smtp.senderName.trim())
      ? smtp.senderName.trim()
      : (emailData.signOffName || 'Reputation Support Team');

    const subject = (emailData.subject && emailData.subject.trim())
      ? emailData.subject.trim()
      : 'Removal of negative reviews on your Google profile';

    const { html, text } = generateEmailContent({
      teamName: emailData.teamName,
      reviewLinks: reviewLinks,
      signOffName: senderDisplayName
    });

    const mailOptions = {
      from: `"${senderDisplayName}" <${smtp.user.trim()}>`,
      to: emailData.to.trim(),
      subject: subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return res.json({
      success: true,
      message: 'Email successfully sent!',
      messageId: info.messageId,
      accepted: info.accepted
    });

  } catch (error) {
    console.error('Send Email Error:', error);
    let errMsg = error.message;
    if (error.code === 'EAUTH') {
      errMsg = 'Gmail authentication failed. Please check your App Password.';
    }
    return res.status(500).json({
      success: false,
      message: errMsg
    });
  }
});

// Update package.json scripts or general check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Express Server locally or export for Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
