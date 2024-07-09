import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import styles from "../styles/Navbar.module.css";

const Header = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  return (
    <header className={styles.header}>
      <nav className={`navbar navbar-expand-lg navbar-light ${styles.navbar}`}>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/" legacyBehavior>
                <a className={`nav-link ${styles.link}`}>Home</a>
              </Link>
            </li>
            
            {isAdmin && (
              <li className="nav-item">
                <Link href="/employees" legacyBehavior>
                  <a className={`nav-link ${styles.link}`}>Employees</a>
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link href="/attendance" legacyBehavior>
                <a className={`nav-link ${styles.link}`}>Attendance</a>
              </Link>
            </li>
          </ul>

          {session && (
            <button onClick={() => signOut()} className={`btn btn-outline-danger ${styles.logoutBtn}`}>
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
