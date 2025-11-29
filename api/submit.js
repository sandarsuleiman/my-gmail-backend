import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { ser, us, emails = [], workerEmail, name } = req.body;

  let toEmails = [...emails];
  if (workerEmail) toEmails.push(workerEmail);

  const transporter = nodemailer.createTransporter({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Form" <${process.env.GMAIL_USER}>`,
      to: toEmails.join(", "),
      subject: `New Form - ${name || "Someone"}`,
      html: `<h3>New Submission</h3><p><b>Name:</b> ${name}</p><p><b>Service:</b> ${ser}</p><p><b>Use:</b> ${us}</p>`,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}
