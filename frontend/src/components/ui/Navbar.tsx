import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar: React.FC<{ disabled?: boolean; restrictedMode?: boolean }> = ({
  disabled,
  restrictedMode,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Function to determine if a link is active
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    // Redirect to login
    navigate("/login");
  };

  const handleDisabledClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
    }
  };

  const handleRestrictedClick = (e: React.MouseEvent) => {
    if (restrictedMode) {
      e.preventDefault();
    }
  };

  return (
    <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon-wrapper">
            <span className="logo-icon">🚀</span>
          </div>
          <span className={`logo-text ${isSidebarCollapsed ? "hidden" : ""}`}>
            <span className="logo-title">Career Navigator</span>
          </span>
        </div>
        <button
          className="toggle-btn"
          onClick={toggleSidebar}
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          <i className={`bi bi-chevron-${isSidebarCollapsed ? "right" : "left"}`}></i>
        </button>
      </div>

      <nav className="nav-menu">
        <div className="nav-menu-top">
          <ul className="nav-menu-list">
            <li className="nav-item">
              <a
                href="/dashboard"
                onClick={handleDisabledClick}
                className={`nav-link ${
                  isActiveLink("/dashboard") ? "active" : ""
                } ${disabled ? "disabled-link" : ""}`}
                style={
                  disabled
                    ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }
                    : {}
                }
              >
                <div className="nav-icon-wrapper">
                  <span className="nav-icon">
                    <i className="bi bi-speedometer2"></i>
                  </span>
                </div>
                <span
                  className={`nav-text ${isSidebarCollapsed ? "hidden" : ""}`}
                >
                  Dashboard
                </span>
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/resume-analysis"
                onClick={handleDisabledClick}
                className={`nav-link ${
                  isActiveLink("/resume-analysis") ? "active" : ""
                } ${disabled ? "disabled-link" : ""}`}
                style={
                  disabled
                    ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }
                    : {}
                }
              >
                <div className="nav-icon-wrapper">
                  <span className="nav-icon">
                    <i className="bi bi-file-earmark-text"></i>
                  </span>
                </div>
                <span
                  className={`nav-text ${isSidebarCollapsed ? "hidden" : ""}`}
                >
                  Resume Analysis
                </span>
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/mock-interview"
                onClick={(e) => {
                  handleDisabledClick(e);
                  handleRestrictedClick(e);
                }}
                className={`nav-link ${
                  isActiveLink("/mock-interview") ? "active" : ""
                } ${disabled || restrictedMode ? "disabled-link" : ""}`}
                style={
                  disabled || restrictedMode
                    ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }
                    : {}
                }
              >
                <div className="nav-icon-wrapper">
                  <span className="nav-icon">
                    <i className="bi bi-mic"></i>
                  </span>
                </div>
                <span
                  className={`nav-text ${isSidebarCollapsed ? "hidden" : ""}`}
                >
                  Mock Interview
                </span>
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/career-guidance"
                onClick={(e) => {
                  handleDisabledClick(e);
                  handleRestrictedClick(e);
                }}
                className={`nav-link ${
                  isActiveLink("/career-guidance") ? "active" : ""
                } ${disabled || restrictedMode ? "disabled-link" : ""}`}
                style={
                  disabled || restrictedMode
                    ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }
                    : {}
                }
              >
                <div className="nav-icon-wrapper">
                  <span className="nav-icon">
                    <i className="bi bi-compass"></i>
                  </span>
                </div>
                <span
                  className={`nav-text ${isSidebarCollapsed ? "hidden" : ""}`}
                >
                  Career Guidance
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div className="nav-menu-bottom">
          <div className="nav-divider"></div>
          <ul className="nav-menu-list">
            <li className="nav-item">
              <button
                onClick={handleLogout}
                className="nav-link text-start border-0 bg-transparent"
                style={{ cursor: "pointer" }}
              >
                <div className="nav-icon-wrapper">
                  <span className="nav-icon">
                    <i className="bi bi-box-arrow-right"></i>
                  </span>
                </div>
                <span
                  className={`nav-text ${isSidebarCollapsed ? "hidden" : ""}`}
                >
                  Logout
                </span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Navbar;
