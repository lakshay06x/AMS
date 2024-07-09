import { useState, useEffect } from "react";
import axios from "axios";
import EmployeeTable from "../components/EmployeeTable";
import Header from "../components/Navbar";
import withAuth from "../components/withAuth";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    officeId: "",
    name: "",
    shiftStarts: "",
    shiftEnds: "",
    isAdmin: false,
    username: "",
    password: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await axios.get("/api/employees");
      setEmployees(response.data);
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setNewEmployee({ ...newEmployee, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/employees", newEmployee);
      // After adding the new employee, refresh the employee list
      const response = await axios.get("/api/employees");
      setEmployees(response.data);
      // Clear the form fields
      setNewEmployee({
        officeId: "",
        name: "",
        shiftStarts: "",
        shiftEnds: "",
        isAdmin: false,
        username: "",
        password: "",
      });
    } catch (error) {
      window.alert("Employee already exists!");
    }
  };

  return (
    <div className="container-fluid">
      <Header />
      <main className="main">
        <h1 className="mb-4">Employees</h1>
        <form className="mb-4" onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="number"
                className="form-control"
                name="officeId"
                placeholder="Office ID"
                value={newEmployee.officeId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Name"
                value={newEmployee.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="time"
                className="form-control"
                name="shiftStarts"
                placeholder="Shift Starts"
                value={newEmployee.shiftStarts}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <input
                type="time"
                className="form-control"
                name="shiftEnds"
                placeholder="Shift Ends"
                value={newEmployee.shiftEnds}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="isAdmin"
              checked={newEmployee.isAdmin}
              onChange={handleChange}
            />
            <label className="form-check-label">Is Admin</label>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="Username"
                value={newEmployee.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={newEmployee.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Add Employee
          </button>
        </form>
        <EmployeeTable employees={employees} setEmployees={setEmployees} />
      </main>
    </div>
  );
};

export default withAuth(EmployeesPage, { adminOnly: true });
