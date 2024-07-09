import Link from "next/link";
import withAuth from "../components/withAuth";
import { useSession } from "next-auth/react";
import { useState } from "react";

const HomePage = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const [activeTab, setActiveTab] = useState(isAdmin ? 'employees' : 'attendance');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card text-center shadow-lg p-4" style={{ width: '24rem' }}>
        <div className="card-body">
          <h1 className="card-title mb-4 text-primary">Attendance Application</h1>
          <ul className="nav nav-tabs mb-3" id="myTab" role="tablist">
            {isAdmin && (
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'employees' ? 'active' : ''}`} 
                  id="employees-tab" 
                  type="button" 
                  role="tab" 
                  onClick={() => handleTabClick('employees')}
                  aria-controls="employees" 
                  aria-selected={activeTab === 'employees'}
                >
                  Employees
                </button>
              </li>
            )}
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`} 
                id="attendance-tab" 
                type="button" 
                role="tab" 
                onClick={() => handleTabClick('attendance')}
                aria-controls="attendance" 
                aria-selected={activeTab === 'attendance'}
              >
                Attendance
              </button>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            {isAdmin && (
              <div 
                className={`tab-pane fade ${activeTab === 'employees' ? 'show active' : ''}`} 
                id="employees" 
                role="tabpanel" 
                aria-labelledby="employees-tab"
              >
                <Link href="/employees" legacyBehavior>
                  <a className="btn btn-outline-primary">Go to Employees</a>
                </Link>
              </div>
            )}
            <div 
              className={`tab-pane fade ${activeTab === 'attendance' ? 'show active' : ''}`} 
              id="attendance" 
              role="tabpanel" 
              aria-labelledby="attendance-tab"
            >
              <Link href="/attendance" legacyBehavior>
                <a className="btn btn-outline-primary">Go to Attendance</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(HomePage);
