import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import connectDB from '../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const code = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    

    await transporter.sendMail({
      from: `"TripnStay" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset Code',
      text: `Your verification code is: ${code}`,
      html: `<p>Your verification code is: <b>${code}</b></p>`,
    });

    const mongoose = await connectDB();
    // await mongoose.connection.db.collection('password_reset_codes').updateOne(
    //   { email },
    //   {
    //     $set: {
    //       code: code.toString(),
    //       expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
    //     },
    //   },
    //   { upsert: true }
    // );

    res.status(200).json({ message: 'Reset code sent successfully' });
  } catch ( error ) {
    res.status(500).json({ message: 'Email could not be sent', error: error });
  }
}
