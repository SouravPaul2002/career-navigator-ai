import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Create FormData for OAuth2 password flow
      const formData = new FormData();
      formData.append("username", email); // Backend expects 'username' field
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Login failed");
      }

      const data = await response.json();

      // Store the access token
      localStorage.setItem("access_token", data.access_token);


      // Fetch user details using the token
      const userRes = await fetch("http://localhost:8000/users/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        localStorage.setItem("user", JSON.stringify(userData));
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "radial-gradient(circle at center, #2a2a40, #121212)",
      }}
    >
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-5 col-xl-4">
          <div className="card shadow-lg border-0 glass-panel text-white">
            <div className="card-body p-1">
              <div className="text-center mb-1">
                <i className="bi bi-person-circle display-4 text-primary mb-3"></i>
                <h2 className="fw-bold text-white">Welcome Back</h2>
                <p className="text-white">
                  Sign in to continue your career journey
                </p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label text-light">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control bg-dark text-white border-secondary"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      style={{ fontSize: "1rem", padding: "0.75rem" }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label text-light">
                    Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control bg-dark text-white border-secondary"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      style={{ fontSize: "1rem", padding: "0.75rem" }}
                    />
                    <button
                      className="btn btn-outline-secondary border-secondary bg-dark text-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <a href="#" className="text-primary text-decoration-none">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow"
                  style={{
                    background: "linear-gradient(90deg, #00d2ff, #3a7bd5)",
                    border: "none",
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {error && (
                  <div className="alert alert-danger mt-3" role="alert">
                    {error}
                  </div>
                )}
              </form>

              <div className="text-center mt-4">
                <p className="text-white">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-primary fw-bold text-decoration-none"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
