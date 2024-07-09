import { useState } from "react";
import axios from "axios";

const EmployeeTable = ({ employees, setEmployees }) => {
  const [editMode, setEditMode] = useState(null);
  const [shiftStarts, setShiftStarts] = useState("");
  const [shiftEnds, setShiftEnds] = useState("");

  const handleEdit = (employee) => {
    setEditMode(employee._id);
    setShiftStarts(employee.shiftStarts);
    setShiftEnds(employee.shiftEnds);
  };

  const handleSave = async (employeeId) => {
    await axios.put(`/api/employees?id=${employeeId}`, {
      shiftStarts,
      shiftEnds,
    });
    setEditMode(null);
    // Refresh the employee list after update
    const response = await axios.get("/api/employees");
    setEmployees(response.data);
  };

  const handleDelete = async (employeeId) => {
    await axios.delete(`/api/employees?id=${employeeId}`);
    // Refresh the employee list after delete
    const response = await axios.get("/api/employees");
    setEmployees(response.data);
  };

  return (
    <table className="table table-bordered table-striped">
      <thead className="table-dark">
        <tr>
          <th>Office ID</th>
          <th>Name</th>
          <th>Shift Starts</th>
          <th>Shift Ends</th>
          <th>isAdmin</th>
          <th>Username</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee._id}>
            <td>{employee.officeId}</td>
            <td>{employee.name}</td>
            <td>
              {editMode === employee._id ? (
                <input
                  type="text"
                  className="form-control"
                  value={shiftStarts}
                  onChange={(e) => setShiftStarts(e.target.value)}
                />
              ) : (
                employee.shiftStarts
              )}
            </td>
            <td>
              {editMode === employee._id ? (
                <input
                  type="text"
                  className="form-control"
                  value={shiftEnds}
                  onChange={(e) => setShiftEnds(e.target.value)}
                />
              ) : (
                employee.shiftEnds
              )}
            </td>
            <td>{employee.isAdmin ? "Yes" : "No"}</td>
            <td>{employee.username}</td>
            <td>
              {editMode === employee._id ? (
                <button className="btn btn-success me-2" onClick={() => handleSave(employee._id)}>Save</button>
              ) : (
                <div>
                  <button className="btn btn-primary me-2" onClick={() => handleEdit(employee)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(employee._id)}>Delete</button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;
