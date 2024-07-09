import 'bootstrap/dist/css/bootstrap.min.css';
import styles from "../styles/Tabs.module.css";

const MonthTabs = ({ year, months, onMonthClick }) => {
  return (
    <div className="card border-0 mb-4">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-auto">
            <h4 className="mb-0" style={{marginTop: "-15px"}}>{year}</h4>
          </div>
          <div className="col">
            <div className={`d-flex justify-content-start gap-3 flex-wrap ${styles.tabs}`}>
              {months.map(month => (
                <button
                  key={month}
                  className={`btn btn-link text-decoration-none text-white text-uppercase fw-bold ${styles.tab}`}
                  onClick={() => onMonthClick(year, month)}
                  style={{ height: "60px" }} // Adjust height as needed
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthTabs;
