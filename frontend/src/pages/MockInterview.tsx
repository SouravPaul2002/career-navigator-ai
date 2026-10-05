import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

interface Message {
  id: number;
  sender: "user" | "ai";
  content: string;
  timestamp: string;
}

interface Session {
  id: number;
  job_role: string;
  is_active: boolean;
}

const MockInterview: React.FC = () => {
  const [jobRole, setJobRole] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceConfirm, setShowVoiceConfirm] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");

  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [checkingHistory, setCheckingHistory] = useState(true);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (token && !session) {
      checkResumeHistory();
    }
  }, [token, session]);

  const checkResumeHistory = async () => {
    setCheckingHistory(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/career/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Extract unique domains from history
      const history = response.data;
      const roles = Array.from(
        new Set(history.map((item: any) => item.domain))
      ).filter((r: any) => r && r !== "N/A") as string[];
      setAvailableRoles(roles);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setCheckingHistory(false);
    }
  };

  const startSession = async () => {
    if (!jobRole.trim()) return;
    setInitializing(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/interview/sessions",
        { job_role: jobRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSession(response.data);
      // Fetch initial greeting
      fetchMessages(response.data.id);
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session. Please try again.");
    } finally {
      setInitializing(false);
    }
  };

  const fetchMessages = async (sessionId: number) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/interview/sessions/${sessionId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !session) return;

    const tempMsg: Message = {
      id: Date.now(), // Temp ID
      sender: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/interview/sessions/${session.id}/chat`,
        { message: tempMsg.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // --- Voice Input Logic ---

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      setShowVoiceConfirm(true);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      alert("Error recognizing voice. Please try again.");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const confirmVoiceInput = () => {
    if (voiceText) {
      setInputMessage((prev) => (prev ? prev + " " + voiceText : voiceText));
    }
    setShowVoiceConfirm(false);
    setVoiceText("");
  };

  const cancelVoiceInput = () => {
    setShowVoiceConfirm(false);
    setVoiceText("");
  };

  if (!token) {
    navigate("/login");
    return null;
  }

  return (
    <Layout title="AI Mock Interview">
      <div className="container" style={{ maxWidth: "900px" }}>
        {!session ? (
          // Setup Screen
          <div
            className="card shadow border-0 rounded-4 mt-5"
            style={{ backgroundColor: "var(--color-card-bg)" }}
          >
            <div className="card-body p-5 text-center">
              <i className="bi bi-robot display-1 text-primary mb-4"></i>
              <h2
                className="fw-bold mb-3"
                style={{ color: "var(--color-text)" }}
              >
                AI Mock Interviewer
              </h2>

              {checkingHistory ? (
                <div className="my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p
                    className="mt-2"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    Checking your resume profile...
                  </p>
                </div>
              ) : availableRoles.length === 0 ? (
                <div className="my-4">
                  <div
                    className="alert alert-warning border-0 rounded-4"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>No Resume Found!</strong>
                  </div>
                  <p
                    className="mb-4"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    To conduct a personalized mock interview, we first need to
                    understand your background. Please upload and analyze your
                    resume first.
                  </p>
                  <button
                    className="btn btn-primary btn-lg rounded-pill px-5"
                    onClick={() => navigate("/resume-analysis")}
                  >
                    Go to Resume Analysis
                  </button>
                </div>
              ) : (
                <>
                  <p
                    className="mb-4"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    Select one of your identified job roles to begin the
                    interview.
                  </p>

                  <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                    {availableRoles.map((role) => (
                      <button
                        key={role}
                        className={`btn btn-lg rounded-pill px-4 py-2 ${
                          jobRole === role
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => setJobRole(role)}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  <div className="row justify-content-center">
                    <div className="col-md-8">
                      <button
                        className="btn btn-primary btn-lg w-50 rounded-pill"
                        onClick={startSession}
                        disabled={initializing || !jobRole}
                      >
                        {initializing ? (
                          <span>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Starting...
                          </span>
                        ) : (
                          "Start Interview"
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          // Chat Screen
          <div
            className="card shadow border-0 rounded-4"
            style={{
              height: "85vh",
              display: "flex",
              flexDirection: "column",
              background: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="card-header border-bottom p-3 d-flex justify-content-between align-items-center"
              style={{
                background: "var(--color-card-bg)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            >
              <div>
                <h5 className="mb-0 fw-bold">Interview: {session.job_role}</h5>
                <small className="text-success">
                  <i
                    className="bi bi-circle-fill me-1"
                    style={{ fontSize: "8px" }}
                  ></i>
                  Live Session
                </small>
              </div>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => setSession(null)}
              >
                End Session
              </button>
            </div>

            <div
              className="card-body p-4"
              style={{
                flexGrow: 1,
                overflowY: "auto",
                background: "var(--color-background)", // Use app background for chat area
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`d-flex mb-3 ${
                    msg.sender === "user"
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-4 shadow-sm ${
                      msg.sender === "user" ? "bg-primary text-white" : ""
                    }`}
                    style={{
                      backgroundColor:
                        msg.sender !== "user"
                          ? "var(--color-card-bg)"
                          : undefined,
                      color:
                        msg.sender !== "user" ? "var(--color-text)" : undefined,
                      width: "fit-content",
                      maxWidth: "75%",
                      borderBottomRightRadius:
                        msg.sender === "user" ? "0" : "1rem",
                      borderBottomLeftRadius:
                        msg.sender === "ai" ? "0" : "1rem",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="d-flex mb-3 justify-content-start">
                  <div
                    className="p-3 rounded-4 shadow-sm d-flex align-items-center"
                    style={{
                      background: "var(--color-card-bg)",
                      color: "var(--color-text)",
                    }}
                  >
                    <div className="typing-indicator me-2">
                      <div
                        className="typing-dot"
                        style={{ backgroundColor: "var(--color-text-light)" }}
                      ></div>
                      <div
                        className="typing-dot"
                        style={{ backgroundColor: "var(--color-text-light)" }}
                      ></div>
                      <div
                        className="typing-dot"
                        style={{ backgroundColor: "var(--color-text-light)" }}
                      ></div>
                    </div>
                    <small style={{ color: "var(--color-text-light)" }}>
                      AI is thinking...
                    </small>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice Confirmation Modal */}
            {showVoiceConfirm && (
              <div
                className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: "rgba(0,0,0,0.5)",
                  zIndex: 1050,
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  className="card shadow-lg border-0 rounded-4"
                  style={{
                    width: "400px",
                    backgroundColor: "var(--color-card-bg)",
                    color: "var(--color-text)",
                  }}
                >
                  <div className="card-body p-4 text-center">
                    <div className="mb-3">
                      <i className="bi bi-mic-fill fs-1 text-primary"></i>
                    </div>
                    <h5 className="fw-bold mb-3">Confirm Voice Input</h5>
                    <p className="mb-4 text-muted fst-italic">
                      "{voiceText}"
                    </p>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={cancelVoiceInput}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary rounded-pill px-4"
                        onClick={confirmVoiceInput}
                      >
                        Use Text
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              className="card-footer p-3 border-top"
              style={{
                background: "var(--color-card-bg)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="input-group">
                <button
                  className={`btn ${
                    isRecording ? "btn-danger" : "btn-outline-primary"
                  } px-3`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  type="button"
                  title={isRecording ? "Stop Recording" : "Start Voice Input"}
                >
                  {isRecording ? (
                    <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="bi bi-mic-fill"></i>
                  )}
                </button>
                <input
                  type="text"
                  className="form-control form-control-lg border-0"
                  placeholder={isRecording ? "Listening..." : "Type your answer here..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={loading || isRecording}
                  style={{
                    background: "var(--color-background)",
                    color: "var(--color-text)",
                  }}
                />
                <button
                  className="btn btn-primary px-4"
                  onClick={sendMessage}
                  disabled={loading || !inputMessage.trim()}
                >
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MockInterview;
