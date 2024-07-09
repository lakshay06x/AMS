import { getSession } from "next-auth/react";
import connectDB from "../../../../utils/db";
import { Attendance, Employee } from "../../../../utils/schemas";

export default async function handler(req, res) {
  const { year, month } = req.query;

  await connectDB();

  // Fetch session to get user info
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const username = session.user.name; //  username is stored in session.user.name
  const user = await Employee.findOne({ username }).lean();

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isAdmin = user.isAdmin;

  if (req.method === "GET") {
    try {
      let attendance;
      if (isAdmin) {
        attendance = await Attendance.find({ year, month }).lean();
      } else {
        attendance = await Attendance.find({ year, month, employeeId: user.officeId }).lean();
      }

      const employees = await Employee.find({}).lean();

      const employeeMap = employees.reduce((acc, employee) => {
        acc[employee.officeId] = employee.name;
        return acc;
      }, {});

      const groupedData = attendance.reduce((acc, record) => {
        if (!acc[record.employeeId]) {
          acc[record.employeeId] = [];
        }
        acc[record.employeeId].push(record);
        return acc;
      }, {});

      const formattedData = Object.entries(groupedData).map(([employeeId, attendanceRecords]) => ({
        employeeId,
        name: employeeMap[employeeId] || "Unknown",
        attendanceRecords,
      }));

      res.status(200).json(formattedData);
    } catch (error) {
      console.error("Error fetching attendance details:", error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
