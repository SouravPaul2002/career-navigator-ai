import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { Modal, Button } from "react-bootstrap";
import ReactMarkdown from "react-markdown";

// Types
interface RoadmapStep {
  id?: number;
  step_title: string; // From API (Generator)
  title?: string; // From DB (Active)
  description: string;
  estimated_duration: string;
  status?: string; // todo, in_progress, done
}

interface CareerRoadmap {
  id?: number;
  role: string;
  steps: RoadmapStep[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

const CareerGuidance: React.FC = () => {
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmap | null>(
    null
  );
  const [previewRoadmap, setPreviewRoadmap] = useState<CareerRoadmap | null>(
    null
  ); // For new generations
  const [currentView, setCurrentView] = useState<"dashboard" | "roadmap">(
    "dashboard"
  ); // Control view

  const [loading, setLoading] = useState(false);
  const [checkingHistory, setCheckingHistory] = useState(true);

  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailContent, setDetailContent] = useState("");
  const [detailTitle, setDetailTitle] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    setCheckingHistory(true);
    try {
      // 1. Fetch Resume History (Roles)
      const historyRes = await axios.get(
        "http://127.0.0.1:8000/career/history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const roles = Array.from(
        new Set(historyRes.data.map((item: any) => item.domain))
      ).filter((r: any) => r && r !== "N/A") as string[];
      setAvailableRoles(roles);

      // 2. Fetch Active Roadmap (if any)
      const activeRes = await axios.get(
        "http://127.0.0.1:8000/guidance/active",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (activeRes.data) {
        setActiveRoadmap(activeRes.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setCheckingHistory(false);
    }
  };

  const generateRoadmap = async () => {
    if (!selectedRole.trim()) return;
    setLoading(true);
    setPreviewRoadmap(null);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/guidance/generate",
        { job_role: selectedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreviewRoadmap(response.data);
      setCurrentView("roadmap"); // Switch to view the new preview
    } catch (error) {
      console.error("Error generating roadmap:", error);
      alert("Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const startTracking = async () => {
    if (!previewRoadmap) return;
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/guidance/save", previewRoadmap, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Reload active roadmap and switch to it
      await loadDashboardData();
      setPreviewRoadmap(null);
      setCurrentView("roadmap"); // Stay on roadmap view, but now it will use activeRoadmap data
    } catch (error) {
      console.error("Error saving roadmap:", error);
      alert("Failed to start tracking.");
      setLoading(false);
    }
  };

  const updateStatus = async (stepId: number, newStatus: string) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/guidance/steps/${stepId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistic update for active roadmap
      if (activeRoadmap) {
        const updatedSteps = activeRoadmap.steps.map((s) =>
          s.id === stepId ? { ...s, status: newStatus } : s
        );
        setActiveRoadmap({ ...activeRoadmap, steps: updatedSteps });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const openDetails = async (topic: string) => {
    setDetailTitle(topic);
    setDetailContent("");
    setShowDetailModal(true);
    setDetailLoading(true);
    const role = activeRoadmap
      ? activeRoadmap.role
      : previewRoadmap?.role || "General";
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/guidance/details",
        { topic, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetailContent(res.data.content);
    } catch (error) {
      setDetailContent("Failed to load details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const openQuiz = async (topic: string) => {
    setDetailTitle(topic);
    setQuizQuestions([]);
    setQuizScore(null);
    setQuizAnswers({});
    setShowQuizModal(true);
    setQuizLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/guidance/quiz",
        { topic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizQuestions(res.data);
    } catch (error) {
      console.error("Error loading quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_answer) score++;
    });
    setQuizScore(score);
  };

  const continueJourney = () => {
    setCurrentView("roadmap");
  };

  const backToDashboard = () => {
    setCurrentView("dashboard");
    setPreviewRoadmap(null); // Clear preview when going back
  };

  if (!token) {
    navigate("/login");
    return null;
  }

  // Determine which roadmap to show
  const displayedRoadmap =
    currentView === "roadmap" ? previewRoadmap || activeRoadmap : null;
  const isPreview = !!previewRoadmap; // If we have a preview, we are not strictly "tracking" it yet (unless it matches active)
  // Actually, simpler logic: if we are displaying activeRoadmap, isTracking is true. If preview, false.
  const isTrackingDisplayed = displayedRoadmap === activeRoadmap;

  // Calculate Progress (only for active)
  const totalSteps = activeRoadmap?.steps.length || 0;
  const completedSteps =
    activeRoadmap?.steps.filter((s) => s.status === "done").length || 0;
  const activeProgressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <Layout
      title={
        currentView === "roadmap" && displayedRoadmap
          ? `Learning Path: ${displayedRoadmap.role}`
          : "Career Guidance"
      }
    >
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* DASHBOARD VIEW */}
        {currentView === "dashboard" && (
          <div className="animate-fade-in">
            <h2 className="fw-bold mb-4 text-primary">
              <i className="bi bi-grid-1x2-fill me-2"></i>My Learning Dashboard
            </h2>

            {checkingHistory ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <>
                {/* Section 1: Active Journey */}
                {activeRoadmap && (
                  <div
                    className="card shadow-sm border-0 rounded-4 mb-5"
                    style={{ backgroundColor: "var(--color-card-bg)" }}
                  >
                    <div className="card-body p-4">
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <h4
                            className="fw-bold mb-1"
                            style={{ color: "var(--color-text)" }}
                          >
                            Current Journey:{" "}
                            <span className="text-primary">
                              {activeRoadmap.role}
                            </span>
                          </h4>
                          <p
                            className="mb-3"
                            style={{ color: "var(--color-text-light)" }}
                          >
                            You made some great progress! Keep it up.
                          </p>
                          <div
                            className="progress"
                            style={{ height: "10px", maxWidth: "400px" }}
                          >
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${activeProgressPercent}%` }}
                            ></div>
                          </div>
                          <small
                            className="mt-2 d-block"
                            style={{ color: "var(--color-text-light)" }}
                          >
                            {activeProgressPercent}% Completed
                          </small>
                        </div>
                        <div className="col-md-4 text-md-end mt-3 mt-md-0">
                          <button
                            className="btn btn-primary rounded-pill px-4 py-2"
                            onClick={continueJourney}
                          >
                            <i className="bi bi-play-fill me-2"></i>Continue
                            Learning
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 2: Explore New Paths */}
                <div
                  className="card shadow-sm border-0 rounded-4 mb-4"
                  style={{ backgroundColor: "var(--color-card-bg)" }}
                >
                  <div className="card-body p-4 p-md-5 text-center">
                    <h3
                      className="fw-bold mb-3"
                      style={{ color: "var(--color-text)" }}
                    >
                      <i className="bi bi-compass me-2"></i>Explore New Career
                      Paths
                    </h3>
                    <p
                      className="mb-4"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Want to pivot? Select a role from your analyzed resume to
                      generate a new roadmap.
                    </p>

                    {availableRoles.length === 0 ? (
                      <div className="alert alert-warning border-0 rounded-4 d-inline-block px-5">
                        <strong>No Resume Analysis Found!</strong>
                        <br />
                        <Link
                          to="/resume-analysis"
                          className="btn btn-warning mt-2 rounded-pill"
                        >
                          Analyze Resume
                        </Link>
                      </div>
                    ) : (
                      <div className="d-flex flex-column align-items-center">
                        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                          {availableRoles.map((role) => (
                            <button
                              key={role}
                              className={`btn rounded-pill px-4 ${
                                selectedRole === role
                                  ? "btn-primary"
                                  : "btn-outline-primary"
                              }`}
                              onClick={() => setSelectedRole(role)}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                        <button
                          className="btn btn-success btn-lg rounded-pill px-5"
                          onClick={generateRoadmap}
                          disabled={loading || !selectedRole}
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <i className="bi bi-stars me-2"></i>
                          )}
                          {loading ? "Generating..." : "Generate New Roadmap"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ROADMAP VIEW */}
        {currentView === "roadmap" && displayedRoadmap && (
          <div className="roadmap-container animate-fade-in">
            <div className="d-flex align-items-center mb-4">
              <button
                className="btn btn-outline-secondary rounded-circle me-3"
                onClick={backToDashboard}
                title="Back to Dashboard"
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <div>
                <h3
                  className="fw-bold m-0"
                  style={{ color: "var(--color-text)" }}
                >
                  Learning Path:{" "}
                  <span className="text-primary">{displayedRoadmap.role}</span>
                </h3>
                {isPreview && (
                  <span className="badge bg-warning text-dark">
                    Preview Mode
                  </span>
                )}
              </div>
            </div>

            {!isTrackingDisplayed ? (
              <div className="alert alert-info border-0 rounded-4 d-flex justify-content-between align-items-center mb-4 shadow-sm">
                <div>
                  <i className="bi bi-info-circle-fill me-2"></i>
                  This is a preview. <strong>Start Tracking</strong> to save
                  this progress.
                </div>
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={startTracking}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Start Tracking Journey"}
                </button>
              </div>
            ) : (
              <div
                className="p-3 rounded-4 shadow-sm mb-4 d-flex align-items-center justify-content-between"
                style={{ backgroundColor: "var(--color-card-bg)" }}
              >
                <span
                  className="fw-bold"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Current Progress:{" "}
                  <span className="text-success">{activeProgressPercent}%</span>
                </span>
                <div
                  className="progress flex-grow-1 mx-3"
                  style={{ height: "8px" }}
                >
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${activeProgressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="timeline">
              {displayedRoadmap.steps.map((step, index) => {
                const title = step.title || step.step_title;
                const isDone = step.status === "done";
                const isInProgress = step.status === "in_progress";
                const borderColor = isDone
                  ? "#198754"
                  : isInProgress
                  ? "#0d6efd"
                  : "#dee2e6"; // We might want a variable for border color too, but grey is okay for now or use var(--color-border)

                return (
                  <div
                    className="card shadow-sm rounded-4 mb-4 position-relative"
                    key={index}
                    style={{
                      border: `1px solid ${borderColor}`,
                      borderLeft: `5px solid ${borderColor}`,
                      backgroundColor: "var(--color-card-bg)",
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            {/* STATUS BADGE/ICON */}
                            <h4
                              className={`card-title fw-bold mb-0 ${
                                isDone ? "text-decoration-line-through" : ""
                              }`}
                              style={{
                                color: isDone
                                  ? "var(--color-text-light)"
                                  : "var(--color-text)",
                              }}
                            >
                              STEP {index + 1}: {title}
                            </h4>
                            {isDone && (
                              <i className="bi bi-check-circle-fill text-success fs-5"></i>
                            )}
                          </div>
                          <span className="badge bg-light text-dark border mt-2">
                            <i className="bi bi-clock me-1"></i>{" "}
                            {step.estimated_duration}
                          </span>
                        </div>

                        {/* STATUS DROPDOWN - Only if tracking */}
                        {isTrackingDisplayed && step.id && (
                          <select
                            className={`form-select form-select-sm w-auto rounded-pill border-${
                              isDone
                                ? "success"
                                : isInProgress
                                ? "primary"
                                : "secondary"
                            }`}
                            value={step.status || "todo"}
                            onChange={(e) =>
                              updateStatus(step.id!, e.target.value)
                            }
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Completed</option>
                          </select>
                        )}
                      </div>

                      <p
                        className="card-text mt-3"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        {step.description}
                      </p>

                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn btn-outline-info btn-sm rounded-pill"
                          onClick={() => openDetails(title || "")}
                        >
                          <i className="bi bi-info-circle me-1"></i>Learn More
                        </button>
                        <button
                          className="btn btn-outline-warning btn-sm rounded-pill"
                          onClick={() => openQuiz(title || "")}
                        >
                          <i className="bi bi-question-circle me-1"></i>Test
                          Understanding
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Learn More Modal */}
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          size="lg"
          centered
          contentClassName="bg-transparent border-0" // Reset bootstrap modal content
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "var(--color-card-bg)",
              color: "var(--color-text)",
            }}
          >
            <Modal.Header
              closeButton
              closeVariant={
                document.body.classList.contains("dark") ? "white" : "white"
              }
            >
              <Modal.Title className="fw-bold">{detailTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {detailLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-2">Fetching explanation...</p>
                </div>
              ) : (
                <div
                  className="markdown-content"
                  style={{ color: "var(--color-text)" }}
                >
                  <ReactMarkdown>{detailContent}</ReactMarkdown>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </div>
        </Modal>

        {/* Quiz Modal */}
        <Modal
          show={showQuizModal}
          onHide={() => setShowQuizModal(false)}
          size="lg"
          centered
          contentClassName="bg-transparent border-0"
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "var(--color-card-bg)",
              color: "var(--color-text)",
            }}
          >
            <Modal.Header
              closeButton
              closeVariant={
                document.body.classList.contains("dark") ? "white" : "white"
              }
            >
              <Modal.Title className="fw-bold">Quiz: {detailTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {quizLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning"></div>
                  <p className="mt-2">Generating quiz questions...</p>
                </div>
              ) : quizScore !== null ? (
                <div className="text-center py-4">
                  <div className="display-1 mb-3">
                    {quizScore >= 3 ? "🎉" : "📚"}
                  </div>
                  <h3 style={{ color: "var(--color-text)" }}>
                    You scored {quizScore} / {quizQuestions.length}
                  </h3>
                  <p style={{ color: "var(--color-text)" }}>
                    {quizScore >= 3
                      ? "Great job! You seem to understand this topic."
                      : "You might want to review this topic again."}
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setQuizScore(null);
                      setShowQuizModal(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <div>
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="mb-4">
                      <h5
                        className="fw-bold mb-3"
                        style={{ color: "var(--color-text)" }}
                      >
                        {idx + 1}. {q.question}
                      </h5>
                      <div className="d-flex flex-column gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="form-check p-0">
                            <input
                              type="radio"
                              className="btn-check"
                              name={`q-${idx}`}
                              id={`q-${idx}-opt-${optIdx}`}
                              autoComplete="off"
                              checked={quizAnswers[idx] === opt}
                              onChange={() =>
                                setQuizAnswers({ ...quizAnswers, [idx]: opt })
                              }
                            />
                            <label
                              className={`btn w-100 text-start border ${
                                quizAnswers[idx] === opt
                                  ? "btn-primary"
                                  : "btn-outline-secondary"
                              }`}
                              htmlFor={`q-${idx}-opt-${optIdx}`}
                              style={{
                                color:
                                  quizAnswers[idx] === opt
                                    ? "white"
                                    : "var(--color-text)",
                                borderColor: "var(--color-border)",
                              }}
                            >
                              {opt}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              {quizScore === null && !quizLoading && (
                <Button
                  variant="success"
                  onClick={submitQuiz}
                  disabled={
                    Object.keys(quizAnswers).length < quizQuestions.length
                  }
                >
                  Submit Answers
                </Button>
              )}
            </Modal.Footer>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default CareerGuidance;
