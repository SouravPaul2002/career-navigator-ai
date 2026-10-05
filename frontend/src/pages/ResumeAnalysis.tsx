import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";

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

const ResumeAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please login to analyze your resume.");
      setAnalyzing(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/career/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Layout title="Resume Analysis" disableNav={!file && !result}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        <div className="d-flex justify-content-end align-items-center mb-4">
          <Link 
            to="/history" 
            className={`btn btn-outline-primary rounded-pill ${(!file && !result) ? 'disabled' : ''}`}
            style={(!file && !result) ? { pointerEvents: 'none', opacity: 0.6 } : {}}
          >
            <i className="bi bi-clock-history me-1"></i> View History
          </Link>
        </div>

        <div
          className="card shadow-lg border-0"
          style={{
            background: "var(--color-card-bg)",
            color: "var(--color-text)",
          }}
        >
          <div className="card-body p-5">
            <h2 className="text-center mb-4 fw-bold text-primary">
              <i className="bi bi-file-earmark-person me-2"></i>Smart Resume
              Analyzer
            </h2>
            <p
              className="text-center mb-5"
              style={{ color: "var(--color-text-light)" }}
            >
              Upload your resume (PDF) to get an instant AI-powered critique,
              strength score, and personalized improvement plan.
            </p>

            {/* Upload Section */}
            <div
              className="mb-5 p-4 rounded-3 text-center"
              style={{
                border: "2px dashed var(--color-border)",
                backgroundColor: "rgba(0,0,0,0.02)", // Subtle background
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="form-control d-none"
                id="resumeUpload"
              />
              <label
                htmlFor="resumeUpload"
                className="btn btn-outline-info btn-lg px-4 rounded-pill"
              >
                <i className="bi bi-cloud-upload me-2"></i>Select Resume (PDF)
              </label>
              {file && (
                <p className="mt-3 text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  {file.name}
                </p>
              )}

              <div className="mt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={!file || analyzing}
                  className="btn btn-primary btn-lg px-5 rounded-pill shadow"
                >
                  {analyzing ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Analyzing...
                    </span>
                  ) : (
                    "Analyze Now"
                  )}
                </button>
              </div>
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>

            {/* Results Section */}
            {result && (
              <div className="animate-fade-in">
                <hr
                  className="my-5"
                  style={{ borderColor: "var(--color-border)" }}
                />

                {/* Score & Domain */}
                <div className="row align-items-center mb-5">
                  <div className="col-md-4 text-center">
                    <div className="position-relative d-inline-block">
                      <svg width="150" height="150" viewBox="0 0 150 150">
                        <circle
                          cx="75"
                          cy="75"
                          r="70"
                          stroke="var(--color-border)"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <circle
                          cx="75"
                          cy="75"
                          r="70"
                          stroke={
                            result.analysis.score > 70
                              ? "#00d2ff"
                              : result.analysis.score > 40
                              ? "#ffce00"
                              : "#ff4d4d"
                          }
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray="440"
                          strokeDashoffset={
                            440 - (440 * result.analysis.score) / 100
                          }
                          style={{
                            transition: "stroke-dashoffset 1s ease-in-out",
                            transform: "rotate(-90deg)",
                            transformOrigin: "center",
                          }}
                        />
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle text-center">
                        <h2
                          className="mb-0 fw-bold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {result.analysis.score}
                        </h2>
                        <small style={{ color: "var(--color-text-light)" }}>
                          Score
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <h3
                      className="fw-bold mb-3"
                      style={{ color: "var(--color-text)" }}
                    >
                      {result.analysis.identified_domain}
                    </h3>
                    <p style={{ color: "var(--color-text-light)" }}>
                      Currently identified professional domain based on your
                      skills and experience.
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {result.extracted_skills.all_skills
                        .slice(0, 5)
                        .map((s, idx) => (
                          <span
                            key={idx}
                            className="badge bg-secondary border border-secondary text-light px-3 py-2 rounded-pill"
                          >
                            {s.skill_name}
                          </span>
                        ))}
                      {result.extracted_skills.all_skills.length > 5 && (
                        <span className="badge bg-secondary px-3 py-2 rounded-pill">
                          +{result.extracted_skills.all_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gaps & Recommendations */}
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
                        {result.analysis.missing_skills.map((skill, i) => (
                          <li
                            key={i}
                            className="list-group-item bg-transparent border-secondary"
                            style={{ color: "var(--color-text)" }}
                          >
                            <i className="bi bi-x-circle text-danger me-2"></i>
                            {skill}
                          </li>
                        ))}
                        {result.analysis.missing_skills.length === 0 && (
                          <li className="list-group-item bg-transparent text-success">
                            No critical gaps found!
                          </li>
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
                        {result.analysis.recommended_courses.map(
                          (course, i) => (
                            <li
                              key={i}
                              className="list-group-item bg-transparent border-secondary"
                              style={{ color: "var(--color-text)" }}
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
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResumeAnalysis;
// End of component
