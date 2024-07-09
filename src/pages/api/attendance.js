import connectDB from "../../utils/db";
import { Attendance } from "../../utils/schemas";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

// Multer configuration for file upload using disk storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

const uploadMiddleware = upload.single("file");

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  await connectDB();

  if (req.method === "GET") {
    try {
      const attendance = await Attendance.find({}).select("month year").lean();
      const uniqueMonthsYears = [
        ...new Set(attendance.map((item) => `${item.year}-${item.month}`)),
      ].map((str) => {
        const [year, month] = str.split("-");
        return { year, month };
      });
      return res.status(200).json(uniqueMonthsYears);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === "POST") {
    return new Promise((resolve, reject) => {
      uploadMiddleware(req, res, async (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          return res.status(500).json({ message: "File upload failed." });
        }

        try {
          const file = req.file;
          if (!file) {
            return res.status(400).json({ message: "No file uploaded." });
          }
          console.log("File uploaded successfully.");

          const workbook = xlsx.readFile(file.path);
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

          const attendanceData = {};

          const setAttendanceData = (ID, date, checkIn, checkOut, month, year) => {
            if (!attendanceData[ID]) {
              attendanceData[ID] = {};
            }
            if (!attendanceData[ID][date]) {
              attendanceData[ID][date] = {
                checkIns: [],
                checkOuts: [],
                month,
                year,
              };
            }
            if (checkIn) {
              attendanceData[ID][date].checkIns.push(checkIn);
            }
            if (checkOut) {
              attendanceData[ID][date].checkOuts.push(checkOut);
            }
          };

          rows.forEach((row) => {
            const ID = row[Object.keys(row)[0]];
            const rowDate = row[Object.keys(row)[1]];
            const checkCode = row[Object.keys(row)[3]];

            let date;
            if (typeof rowDate === "number") {
              const timestamp = (rowDate - 25569) * 86400 * 1000;
              date = new Date(timestamp);
            } else if (typeof rowDate === "string") {
              date = new Date(rowDate);
            }

            const formattedDate = date.toISOString().split("T")[0];
            const time = date.toISOString().split("T")[1];
            const [hours, minutes] = time.split(":").map(Number);
            const month = date.toLocaleString("default", { month: "long" });
            const year = date.getFullYear().toString();

            if (checkCode === 0) {
              if (hours >= 0 && hours < 8) {
                return;
              }
              setAttendanceData(ID, formattedDate, time, null, month, year);
            } else if (checkCode === 1) {
              if (hours >= 0 && hours < 8) {
                const previousDate = new Date(date);
                previousDate.setDate(previousDate.getDate() - 1);
                const formattedPreviousDate = previousDate.toISOString().split("T")[0];
                const prevMonth = previousDate.toLocaleString("default", { month: "long" });
                const prevYear = previousDate.getFullYear().toString();

                setAttendanceData(
                  ID,
                  formattedPreviousDate,
                  null,
                  time,
                  prevMonth,
                  prevYear
                );
              } else {
                setAttendanceData(ID, formattedDate, null, time, month, year);
              }
            }
          });

          const finalAttendanceData = [];
          for (const [employeeId, dates] of Object.entries(attendanceData)) {
            for (const [date, times] of Object.entries(dates)) {
              const earliestCheckIn = times.checkIns.length
                ? times.checkIns.reduce((a, b) => (a < b ? a : b))
                : null;
              const latestCheckOut = times.checkOuts.length
                ? times.checkOuts.reduce((a, b) => (a > b ? a : b))
                : null;
              finalAttendanceData.push({
                employeeId: parseInt(employeeId),
                date,
                checkIn: earliestCheckIn,
                checkOut: latestCheckOut,
                month: times.month,
                year: times.year,
              });
            }
          }

          // console.log("Final Attendance Data:", finalAttendanceData);

          await Attendance.insertMany(finalAttendanceData);

          fs.unlink(file.path, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
              return reject(err);
            }
            console.log("File deleted successfully.");
            res.status(200).json({ message: "Attendance data uploaded successfully." });
            resolve();
          });
        } catch (error) {
          console.error("Error uploading attendance data:", error);
          res.status(500).json({ message: error.message });
          reject(error);
        }
      });
    });
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
};

export default handler;
