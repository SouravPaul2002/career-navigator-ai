import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";

const Dashboard: React.FC = () => {
  const [hasResume, setHasResume] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkHistory = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("http://localhost:8000/career/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setHasResume(data && data.length > 0);
        }
      } catch (error) {
        console.error("Failed to check history", error);
      } finally {
        setLoading(false);
      }
    };
    checkHistory();
  }, []);

  // Restricted mode should be active if loading OR if no resume found (safe default)
  const restrictedMode = loading || !hasResume;

  const getRestrictedStyle = () => {
    return restrictedMode
      ? { opacity: 0.6, pointerEvents: "none" as const, filter: "grayscale(0.8)" }
      : {};
  };

  return (
    <Layout title="Dashboard" restrictedMode={restrictedMode}>
      <div className="container-fluid p-5">
        <h1 className="text-center mb-5 fw-bold text-gradient animate-fade-in">
          Welcome to Career Navigator
        </h1>

        <div className="row g-4">
          {/* Feature 1: Smart Resume Analyzer */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm hover-lift glass-panel">
              <div className="card-body text-center p-4 d-flex flex-column">
                <div className="mb-4">
                  <i className="bi bi-file-earmark-person display-4 text-info"></i>
                </div>
                <h4 className="card-title fw-bold mb-3 text-gradient">
                  Smart Resume Analyzer
                </h4>
                <p className="card-text text-muted small flex-grow-1">
                  Upload your resume to get AI-driven scoring, gap analysis, and
                  skill extraction compared to industry standards.
                </p>
                <Link
                  to="/resume-analysis"
                  className="btn btn-outline-info rounded-pill mt-3 stretched-link hvr-grow"
                >
                  Launch Tool <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Feature 2: Career Path Recommendation */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm hover-lift glass-panel" style={getRestrictedStyle()}>
              <div className="card-body text-center p-4 d-flex flex-column">
                <div className="mb-4">
                  <i className="bi bi-compass display-4 text-success"></i>
                </div>
                <h4 className="card-title fw-bold mb-3 text-gradient">
                  Career Path Engine
                </h4>
                <p className="card-text text-muted small flex-grow-1">
                  Get personalized career tracks (e.g. Data Scientist, UX
                  Designer) and roadmaps based on your profile.
                </p>
                <Link
                  to="/career-guidance"
                  className="btn btn-outline-success rounded-pill mt-3 stretched-link"
                  style={restrictedMode ? { pointerEvents: "none" } : {}}
                >
                  Use Tool
                </Link>
              </div>
              {restrictedMode && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.4)", borderRadius: "inherit" }}>
                   <span className="badge bg-secondary p-2"><i className="bi bi-lock-fill me-1"></i> Analyze Resume First</span>
                </div>
              )}
            </div>
          </div>

          {/* Feature 3: AI Mock Interview */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm hover-lift glass-panel" style={getRestrictedStyle()}>
              <div className="card-body text-center p-4 d-flex flex-column">
                <div className="mb-4">
                  <i className="bi bi-robot display-4 text-warning"></i>
                </div>
                <h4 className="card-title fw-bold mb-3 text-gradient">
                  AI Mock Interview
                </h4>
                <p className="card-text text-muted small flex-grow-1">
                  Practice with our AI Chatbot. Receive feedback on tone,
                  clarity, and technical answers.
                </p>
                <Link
                  to="/mock-interview"
                  className="btn btn-outline-warning rounded-pill mt-3 stretched-link"
                  style={restrictedMode ? { pointerEvents: "none" } : {}}
                >
                  Use Tool
                </Link>
              </div>
               {restrictedMode && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.4)", borderRadius: "inherit" }}>
                   <span className="badge bg-secondary p-2"><i className="bi bi-lock-fill me-1"></i> Analyze Resume First</span>
                </div>
              )}
            </div>
          </div>

          {/* Feature 4: View Past Analyses */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm hover-lift glass-panel" style={getRestrictedStyle()}>
              <div className="card-body text-center p-4 d-flex flex-column">
                <div className="mb-4">
                  <i className="bi bi-clock-history display-4 text-primary"></i>
                </div>
                <h4 className="card-title fw-bold mb-3 text-gradient">
                  Analysis History
                </h4>
                <p className="card-text text-muted small flex-grow-1">
                  Revisit your previous resume analysis reports, track your
                  progress, and see how your score has improved.
                </p>
                <Link
                  to="/history"
                  className="btn btn-outline-primary rounded-pill mt-3 stretched-link"
                  style={restrictedMode ? { pointerEvents: "none" } : {}}
                >
                  View History <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
               {restrictedMode && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.4)", borderRadius: "inherit" }}>
                   <span className="badge bg-secondary p-2"><i className="bi bi-lock-fill me-1"></i> Analyze Resume First</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
