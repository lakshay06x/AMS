import connectDB from "../../../utils/db";
import { Employee } from "../../../utils/schemas";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    const { officeId, username, newPassword } = req.body;

    try {
      const user = await Employee.findOne({ officeId, username });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.password = newPassword; 
      await user.save();

      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
