import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Employee schema
const employeeSchema = new mongoose.Schema({
  officeId: { type: Number, unique: true },
  name: String,
  shiftStarts: String,
  shiftEnds: String,
  isAdmin: { type: Boolean, default: false },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

// Hash the password before saving
employeeSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Attendance schema
const attendanceSchema = new mongoose.Schema({
  employeeId: Number,
  date: String,
  checkIn: String,
  checkOut: String,
  month: String,
  year: String,
});

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export { Employee, Attendance };
