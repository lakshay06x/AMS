import connectDB from "../../utils/db";
import { Employee } from "../../utils/schemas";

export default async (req, res) => {
  await connectDB();

  switch (req.method) {
    case "GET":
      const employees = await Employee.find({});
      res.status(200).json(employees);
      break;
    case "POST":
      try {
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        res.status(201).json(newEmployee);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;
    case "PUT":
      const { id } = req.query;
      const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(updatedEmployee);
      break;
    case "DELETE":
      const { id: deleteId } = req.query;
      await Employee.findByIdAndDelete(deleteId);
      res.status(204).end();
      break;
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
