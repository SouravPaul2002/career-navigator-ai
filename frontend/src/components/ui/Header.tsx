import { useState, useEffect } from "react";
import ThemeToggle from "../layout/ThemeToggle";

interface User {
  name: string;
  email: string;
  id: number;
}

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Get first letter of name for avatar
  const getInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="dashboard-header">
      <h1 className="dashboard-title">{title || "Dashboard"}</h1>
      <div className="header-actions">
        <ThemeToggle />
        <div className="user-profile">
          <div className="avatar">{getInitial()}</div>
          <span className="user-name">{user?.name || "User"}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
