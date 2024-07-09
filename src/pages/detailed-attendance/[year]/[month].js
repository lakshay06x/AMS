import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../../components/Navbar";
import styles from "../../../styles/AttendanceTable.module.css";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import withAuth from "../../../components/withAuth";

const AttendanceTable = () => {
  const router = useRouter();
  const { year, month } = router.query;
  const [employees, setEmployees] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (year && month) {
        setLoading(true);
        try {
          const res = await fetch(`/api/detailed-attendance/${year}/${month}`);
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await res.json();
          setEmployees(data);

          const parsedYear = parseInt(year, 10);
          const parsedMonth = new Date(`${month} 1, 2000`).getMonth() + 1;
          const daysInMonth = new Date(parsedYear, parsedMonth, 0).getDate();
          const daysArray = [];

          for (let i = 1; i <= daysInMonth; i++) {
            const dayString = `${parsedYear}-${String(parsedMonth).padStart(
              2,
              "0"
            )}-${String(i).padStart(2, "0")}`;
            daysArray.push(dayString);
          }
          setDays(daysArray);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [year, month]);

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const calculateStatus = (shiftStart, checkIn, checkOut) => {
    if (!checkIn && !checkOut) {
      return "A"; // Absent
    }

    if (checkIn) {
      const shiftStartDate = new Date(`1970-01-01T${shiftStart}:00.000Z`);
      const checkInDate = new Date(`1970-01-01T${checkIn}`);

      const differenceInMinutes = (checkInDate - shiftStartDate) / (1000 * 60);

      if (differenceInMinutes > 20) {
        return "L"; // Late
      }
    }

    return "P"; // Present
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container-fluid">
      <Header />
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableCell} rowSpan="2">
              Employee
            </th>
            <th className={styles.tableCell} rowSpan="2">
              Shift Start
            </th>
            <th className={styles.tableCell} rowSpan="2">
              Shift End
            </th>
            {days.map((day, index) => (
              <th key={index} className={styles.tableCell}>
                {new Date(day).toLocaleDateString("default", {
                  month: "short",
                  day: "2-digit",
                })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, empIndex) => (
            <tr key={empIndex}>
              <td className={styles.tableCell}>{employee.name}</td>
              <td className={styles.tableCell}>{employee.shiftStarts}</td>
              <td className={styles.tableCell}>{employee.shiftEnds}</td>
              {days.map((day, statusIndex) => {
                const dayOfWeek = new Date(day).getDay();
                if (dayOfWeek === 6 || dayOfWeek === 0) {
                  // Saturday or Sunday
                  return (
                    <td
                      key={statusIndex}
                      className={styles.tableCell}
                      style={{ backgroundColor: "#f2f2f2" }}
                    >
                      WK
                    </td>
                  );
                }
                const dayAttendance = employee.attendanceRecords.find((a) => {
                  const recordDate = new Date(a.date)
                    .toISOString()
                    .split("T")[0];
                  return recordDate === day;
                });
                const status = calculateStatus(
                  employee.shiftStarts,
                  dayAttendance ? dayAttendance.checkIn : "",
                  dayAttendance ? dayAttendance.checkOut : ""
                );

                const getStatusColor = (status) => {
                  switch (status) {
                    case "P":
                      return "rgb(165 214 167 / 48%)";
                    case "A":
                      return "rgb(239 154 154 / 52%)";
                    case "L":
                      return "rgb(255 204 128 / 42%)";
                    default:
                      return "#000000";
                  }
                };

                const tooltip = (
                  <Tooltip id={`tooltip-${empIndex}-${statusIndex}`}>
                    Check In:{" "}
                    {dayAttendance ? formatTime(dayAttendance.checkIn) : ""}
                    <br />
                    Check Out:{" "}
                    {dayAttendance && dayAttendance.checkOut
                      ? formatTime(dayAttendance.checkOut)
                      : "N/A"}
                  </Tooltip>
                );

                return (
                  <td
                    key={statusIndex}
                    className={styles.tableCell}
                    style={{ backgroundColor: getStatusColor(status) }}
                  >
                    <OverlayTrigger placement="top" overlay={tooltip}>
                      <span className={styles.statusText}>{status}</span>
                    </OverlayTrigger>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default withAuth(AttendanceTable);
