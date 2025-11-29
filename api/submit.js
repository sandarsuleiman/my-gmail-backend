import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { ser, us, emails = [], workerEmail, name } = req.body;

  let finalEmails = [...emails];
  if (workerEmail) finalEmails.push(workerEmail);

  if (finalEmails.length === 0) return res.status(400).json({ error: "No email" });

  // Gmail SMTP transporter (free, bina verify ke kaam karta hai)
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,    // ← Tumhara Gmail (Vercel env mein daal dena)
      pass: process.env.GMAIL_PASS,    // ← Tumhara Gmail app password (neeche bataunga)
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,     // Tumhara Gmail
      to: finalEmails,
      subject: `New Form - ${name || "Someone"}`,
      html: `
        <h2>New Submission!</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Service:</strong> ${ser}</p>
        <p><strong>Use:</strong> ${us}</p>
        <hr>
        <small>Sent from your website</small>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
