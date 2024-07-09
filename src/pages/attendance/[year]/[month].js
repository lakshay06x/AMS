import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../../../styles/MonthlyAttendance.module.css";
import Header from "../../../components/Navbar";
import withAuth from "../../../components/withAuth";

const MonthlyAttendancePage = () => {
  const router = useRouter();
  const { year, month } = router.query;
  const [attendanceDetails, setAttendanceDetails] = useState([]);

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      if (year && month) {
        try {
          const response = await axios.get(`/api/attendance/${year}/${month}`);
          setAttendanceDetails(response.data);
        } catch (error) {
          console.error("Failed to fetch attendance details:", error);
        }
      }
    };

    fetchAttendanceDetails();
  }, [year, month]);

  const roundUp = (num, precision) => {
    precision = Math.pow(10, precision);
    return Math.ceil(num * precision) / precision;
  };

  const calculateAverageWorkingHours = (attendanceRecords) => {
    const totalWorkingHour = attendanceRecords.reduce((total, record) => {
      if (record.checkIn && record.checkOut) {
        const checkIn = new Date(`1970-01-01T${record.checkIn}`);
        let checkOut = new Date(`1970-01-01T${record.checkOut}`);
        if (checkOut < checkIn) {
          checkOut = new Date(checkOut.getTime() + 24 * 60 * 60 * 1000); // Adjust for night shift
        }
        const workingHour = (checkOut - checkIn) / (1000 * 60 * 60); // in hours
        return total + workingHour;
      }
      return total;
    }, 0);

    const presentDays = attendanceRecords.filter(
      (record) => record.checkIn && record.checkOut
    ).length;

    return presentDays ? `${roundUp(totalWorkingHour / presentDays, 2)} Hours` : "0.00 Hours";
  };

  const calculatePresence = (attendanceRecords) => {
    const daysInMonth = new Date(year, new Date(`${month} 1, ${year}`).getMonth() + 1, 0).getDate();
    let presentDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, new Date(`${month} 1, ${year}`).getMonth(), day);
      const isWeekend = currentDay.getDay() === 6 || currentDay.getDay() === 0; // Saturday or Sunday

      if (isWeekend) {
        presentDays++;
      } else {
        const hasEntry = attendanceRecords.some((record) => {
          const recordDate = new Date(record.date);
          return (
            recordDate.getDate() === day &&
            recordDate.getMonth() === currentDay.getMonth() &&
            recordDate.getFullYear() === currentDay.getFullYear()
          );
        });

        if (hasEntry) presentDays++;
      }
    }

    const absentDays = daysInMonth - presentDays;
    return { presentDays, absentDays };
  };

  return (
    <div className="container-fluid">
      <Header />
      <h1 className="mt-4 mb-4">
        Monthly Attendance for {month} {year}
      </h1>
      <Link href={`/detailed-attendance/${year}/${String(month).padStart(2, '0')}`}>
        <button className={styles.overallButton}>Detailed View</button>
      </Link>
      <table className={`table ${styles.table}`}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Average Working Hours</th>
            <th>Total Present Days</th>
            <th>Total Absent Days</th>
          </tr>
        </thead>
        <tbody>
          {attendanceDetails.map(({ employeeId, name, attendanceRecords }) => {
            const { presentDays, absentDays } = calculatePresence(attendanceRecords);
            return (
              <tr key={employeeId}>
                <td>{employeeId}</td>
                <td>{name}</td>
                <td>{calculateAverageWorkingHours(attendanceRecords)}</td>
                <td>{presentDays}</td>
                <td>{absentDays}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default withAuth(MonthlyAttendancePage);
