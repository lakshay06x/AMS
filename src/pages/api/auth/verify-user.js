import connectDB from "../../../utils/db";
import { Employee } from "../../../utils/schemas";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    const { officeId, username } = req.body;

    try {
      const user = await Employee.findOne({ officeId, username }).lean();

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error verifying user' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
