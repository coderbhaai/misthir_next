  // pages/api/signup.ts
  import type { NextApiRequest, NextApiResponse } from 'next';
  import connectDB from '../lib/mongodb';
  import bcrypt from 'bcryptjs';
import { log } from './utils';
import User from 'lib/models/spatie/User';

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      await connectDB();

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) { log(error); }
  }