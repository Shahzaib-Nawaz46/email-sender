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

// Generate email template matching exact user reference (Simple or Standard)
function generateEmailContent({ teamName, reviewLinks, signOffName, format = 'simple' }) {
  const cleanTeamName = teamName ? teamName.trim() : '';
  const cleanSignOff =
    signOffName && signOffName.trim()
      ? signOffName.trim()
      : 'Reputation Support Team';

  const validLinks = (reviewLinks || []).filter(
    l => typeof l === 'string' && l.trim().length > 0
  );

  const textLinks = validLinks
    .map((l, i) => `${i + 1}. ${l.trim()}`)
    .join('\n');

  // Format 1: Simple (Dynamic team name handling)
  if (format === 'simple') {
    let greetingHtml = 'Hello,';
    let greetingText = 'Hello,';

    if (cleanTeamName) {
      const formattedBiz = cleanTeamName.toLowerCase().endsWith('team')
        ? cleanTeamName
        : `${cleanTeamName} Team`;
      greetingHtml = `Hello <strong>${escapeHtml(formattedBiz)}</strong>,`;
      greetingText = `Hello ${formattedBiz},`;
    }

    const links_html = validLinks
      .map(link => `    <li><a href="${escapeHtml(link.trim())}" target="_blank">${escapeHtml(link.trim())}</a></li>`)
      .join('\n');

    const links_text = validLinks
      .map((link, idx) => `${idx + 1}. ${link.trim()}`)
      .join('\n');

    const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>${greetingHtml}</p>
  <p>We have noticed some negative reviews on your profile. We can completely remove them for you. <strong>You only pay AFTER successful removal!</strong></p>
  <p><strong>Review links:</strong></p>
  <ol>
${links_html}
  </ol>
  <p>Best regards,<br><strong>${escapeHtml(cleanSignOff)}</strong></p>
</body>
</html>`;

    const text = `${greetingText}

We have noticed some negative reviews on your profile. We can completely remove them for you. You only pay AFTER successful removal!

Review links:
${links_text}

Best regards,
${cleanSignOff}`;

    return { html, text };
  }

  // Format 2: Standard (Current format)
  const htmlGreeting = cleanTeamName
    ? `Hello <strong>${escapeHtml(cleanTeamName)}</strong>,`
    : `Hello,`;

  const textGreeting = cleanTeamName
    ? `Hello ${cleanTeamName},`
    : `Hello,`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Reviews Notice</title>

  <style>
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background: #ffffff !important;
    }

    body, p, div, li, a, strong {
      font-family: Arial, Helvetica, sans-serif !important;
      color: #000000 !important;
    }

    a {
      color: #000000 !important;
      text-decoration: underline !important;
    }

    @media only screen and (max-width: 600px) {
      .email-content {
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 20px !important;
      }
    }
  </style>
</head>

<body style="margin:0; padding:0; background:#ffffff; color:#000000;">

  <div
    class="email-content"
    style="
      width:100%;
      max-width:700px;
      box-sizing:border-box;
      padding:30px 25px;
      margin:0;
      background:#ffffff;
      color:#000000;
    "
  >

    <p style="font-size:16px; line-height:1.6; margin:0 0 20px 0;">
      ${htmlGreeting}
    </p>

    <p style="font-size:15px; line-height:1.7; margin:0 0 20px 0;">
      We noticed some negative reviews on your Google profile. We can completely
      remove them for you — and
      <strong>you only pay AFTER successful removal</strong>
      (zero upfront payment).
    </p>

    <p style="font-size:15px; font-weight:bold; margin:0 0 10px 0;">
      Review link(s):
    </p>

    <ol
      style="
        margin:0 0 22px 22px;
        padding:0;
        font-size:14px;
        line-height:1.7;
      "
    >
      ${validLinks.map(link => `
        <li style="margin-bottom:8px; word-break:break-all;">
          <a
            href="${escapeHtml(link.trim())}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${escapeHtml(link.trim())}
          </a>
        </li>
      `).join('')}
    </ol>

    <p style="font-size:15px; line-height:1.7; margin:0 0 25px 0;">
      If you'd like us to take care of this for you, simply reply to this email
      and let us know.
    </p>

    <div style="font-size:14px; line-height:1.6;">
      Best regards,<br>
      <strong>${escapeHtml(cleanSignOff)}</strong>
    </div>

  </div>

</body>
</html>`;

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

    const chosenFormat = emailData.format === 'standard' ? 'standard' : 'simple';

    const defaultSubject = chosenFormat === 'simple'
      ? 'Regarding negative reviews on your Google profile'
      : 'Removal of negative reviews on your Google profile';

    const subject = (emailData.subject && emailData.subject.trim())
      ? emailData.subject.trim()
      : defaultSubject;

    const { html, text } = generateEmailContent({
      teamName: emailData.teamName,
      reviewLinks: reviewLinks,
      signOffName: senderDisplayName,
      format: chosenFormat
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
