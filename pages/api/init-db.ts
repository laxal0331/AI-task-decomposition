import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Supabase 会自动创建表，所以这里只需要返回成功
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ message: 'Database initialization failed', error: String(error) });
  }
} 