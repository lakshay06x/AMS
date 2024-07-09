import { useState, useEffect } from "react";
import axios from "axios";
import MonthTabs from "../components/MonthTabs";
import Header from "../components/Navbar";
import { useRouter } from "next/router";
import withAuth from "../components/withAuth";
import { useSession } from "next-auth/react";

const AttendancePage = () => {
  const { data: session } = useSession();
  const [attendanceData, setAttendanceData] = useState([]);
  const [file, setFile] = useState(null);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [uploadedMonths, setUploadedMonths] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.get("/api/attendance");
        const data = response.data;
        setAttendanceData(data);

        // Extract years and months from the data
        const organizedData = data.reduce((acc, item) => {
          if (!acc[item.year]) acc[item.year] = [];
          acc[item.year].push(item.month);
          return acc;
        }, {});
        setUploadedMonths(organizedData);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      }
    };
    fetchAttendanceData();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !year || !month) {
      alert("Please select a file, year, and month.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("year", year);
    formData.append("month", month);

    try {
      await axios.post("/api/attendance", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully.");

      setUploadedMonths((prev) => {
        const updatedMonths = { ...prev };
        if (!updatedMonths[year]) updatedMonths[year] = [];
        updatedMonths[year].push(month);
        return updatedMonths;
      });
    } catch (error) {
      alert("Failed to upload file.");
      console.error("Failed to upload file:", error);
    }
  };

  const handleMonthClick = (year, month) => {
    router.push(`/attendance/${year}/${month}`);
  };

  const isAdmin = session?.user?.isAdmin;

  return (
    <div className="container-fluid">
      <Header />
      <h1 className="mt-4 mb-4">Attendance</h1>
      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="row gx-3 align-items-center mb-3">
            <div className="col-auto">
              <input type="file" className="form-control" onChange={handleFileChange} />
            </div>
            <div className="col-auto">
              <select className="form-select" value={year} onChange={handleYearChange}>
                <option value="">Select Year</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div className="col-auto">
              <select className="form-select" value={month} onChange={handleMonthChange}>
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
            <div className="col-auto">
              <button type="submit" className="btn btn-primary">Upload File</button>
            </div>
          </div>
        </form>
      )}
      <h2 className="mb-3">Uploaded Sheets</h2>
      <div>
        {Object.keys(uploadedMonths).map((year) => (
          <div key={year} className="mb-4">
            <MonthTabs
              year={year}
              months={uploadedMonths[year]}
              onMonthClick={handleMonthClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default withAuth(AttendancePage);
