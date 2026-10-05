import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";

interface HistoryItem {
  id: number;
  filename: string;
  created_at: string;
  score: number;
  domain: string;
}

interface AnalysisResult {
  analysis: {
    identified_domain: string;
    score: number;
    missing_skills: string[];
    recommended_courses: string[];
  };
  extracted_skills: {
    all_skills: { skill_name: string; type: string }[];
  };
}

const PastAnalyses: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisResult | null>(null);
  const [viewingDetail, setViewingDetail] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please login to view history.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/career/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: number) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `http://localhost:8000/career/analysis/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analysis details");
      }

      const data = await response.json();
      setSelectedAnalysis(data);
      setViewingDetail(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <Layout title="Analysis History">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-lg border-0 glass-panel text-white p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-gradient">
                  <i className="bi bi-clock-history me-2"></i>Analysis History
                </h2>
                {viewingDetail && (
                  <button
                    className="btn btn-outline-light btn-sm rounded-pill"
                    onClick={() => setViewingDetail(false)}
                  >
                    <i className="bi bi-arrow-left me-1"></i> Back to History
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">
                    Retrieving your past analyses...
                  </p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : viewingDetail && selectedAnalysis ? (
                <div className="animate-fade-in">
                  {/* Reuse result display logic from ResumeAnalysis.tsx */}
                  <div className="row align-items-center mb-5">
                    <div className="col-md-4 text-center">
                      <div className="position-relative d-inline-block">
                        <svg width="150" height="150" viewBox="0 0 150 150">
                          <circle
                            cx="75"
                            cy="75"
                            r="70"
                            stroke="#333"
                            strokeWidth="10"
                            fill="transparent"
                          />
                          <circle
                            cx="75"
                            cy="75"
                            r="70"
                            stroke={
                              selectedAnalysis.analysis.score > 70
                                ? "#00d2ff"
                                : selectedAnalysis.analysis.score > 40
                                ? "#ffce00"
                                : "#ff4d4d"
                            }
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray="440"
                            strokeDashoffset={
                              440 -
                              (440 * selectedAnalysis.analysis.score) / 100
                            }
                            style={{
                              transition: "stroke-dashoffset 1s ease-in-out",
                              transform: "rotate(-90deg)",
                              transformOrigin: "center",
                            }}
                          />
                        </svg>
                        <div className="position-absolute top-50 start-50 translate-middle text-center">
                          <h2 className="mb-0 fw-bold">
                            {selectedAnalysis.analysis.score}
                          </h2>
                          <small className="text-muted">Score</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <h3 className="fw-bold mb-3">
                        {selectedAnalysis.analysis.identified_domain}
                      </h3>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedAnalysis.extracted_skills.all_skills.map(
                          (s, idx) => (
                            <span
                              key={idx}
                              className="badge bg-dark border border-secondary text-light px-3 py-2 rounded-pill"
                            >
                              {s.skill_name}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row g-4">
                    <div className="col-md-6">
                      <div
                        className="p-4 rounded-3 h-100"
                        style={{
                          backgroundColor: "rgba(255, 77, 77, 0.1)",
                          border: "1px solid rgba(255, 77, 77, 0.2)",
                        }}
                      >
                        <h4 className="text-danger mb-3">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Missing Skills
                        </h4>
                        <ul className="list-group list-group-flush bg-transparent">
                          {selectedAnalysis.analysis.missing_skills.map(
                            (skill, i) => (
                              <li
                                key={i}
                                className="list-group-item bg-transparent text-light border-secondary"
                              >
                                <i className="bi bi-x-circle text-danger me-2"></i>
                                {skill}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div
                        className="p-4 rounded-3 h-100"
                        style={{
                          backgroundColor: "rgba(0, 210, 255, 0.1)",
                          border: "1px solid rgba(0, 210, 255, 0.2)",
                        }}
                      >
                        <h4 className="text-info mb-3">
                          <i className="bi bi-lightbulb me-2"></i>Recommended
                          Actions
                        </h4>
                        <ul className="list-group list-group-flush bg-transparent">
                          {selectedAnalysis.analysis.recommended_courses.map(
                            (course, i) => (
                              <li
                                key={i}
                                className="list-group-item bg-transparent text-light border-secondary"
                              >
                                <i className="bi bi-arrow-right-circle text-info me-2"></i>
                                {course}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-folder-x display-1 text-muted mb-4"></i>
                  <p className="lead text-muted">No analysis history found.</p>
                  <Link
                    to="/resume-analysis"
                    className="btn btn-primary rounded-pill mt-3"
                  >
                    Start Your First Analysis
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle border-secondary">
                    <thead>
                      <tr className="border-secondary">
                        <th>Date</th>
                        <th>Filename</th>
                        <th>Domain</th>
                        <th>Score</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id} className="border-secondary">
                          <td className="text-muted small">
                            {formatDate(item.created_at)}
                          </td>
                          <td>
                            <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                            {item.filename}
                          </td>
                          <td>
                            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill">
                              {item.domain}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`fw-bold ${
                                item.score > 70
                                  ? "text-success"
                                  : item.score > 40
                                  ? "text-warning"
                                  : "text-danger"
                              }`}
                            >
                              {item.score}%
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-link text-primary p-0 hvr-grow"
                              onClick={() => fetchDetail(item.id)}
                            >
                              View Report{" "}
                              <i className="bi bi-chevron-right ms-1"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="text-center mt-4">
              <Link to="/dashboard" className="text-decoration-none text-muted">
                <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PastAnalyses;
