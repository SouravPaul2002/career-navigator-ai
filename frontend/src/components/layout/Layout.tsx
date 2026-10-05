import React from "react";
import Navbar from "../ui/Navbar";
import Header from "../ui/Header";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  disableNav?: boolean;
  restrictedMode?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, disableNav, restrictedMode }) => {
  return (
    <div className="dashboard-layout">
      <Navbar disabled={disableNav} restrictedMode={restrictedMode} />
      <main className="main-content">
        <div className="dashboard-container">
          <Header title={title} />
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
