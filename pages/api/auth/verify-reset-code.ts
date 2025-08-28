import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb'; 
import { clo } from '@amitkk/basic/utils/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  try {
    const mongoose = await connectDB();
    const db = mongoose.connection;

    const record = await db.collection('password_reset_codes').findOne({ email });

    if (!record) {
      return res.status(400).json({ message: 'Reset code not found' });
    }

    const now = new Date();
    if (record.code !== code) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    if (record.expiresAt < now) {
      return res.status(400).json({ message: 'Code has expired' });
    }

    await db.collection('password_reset_codes').deleteOne({ email });

    return res.status(200).json({ message: 'Code verified successfully' });
  } catch ( error ) { clo(error); }
}
