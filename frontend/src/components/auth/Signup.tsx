import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Signup failed. Please try again.");
      }

      const userData = await response.json();

      // After successful signup, log the user in
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const loginResponse = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        body: formData,
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        localStorage.setItem("access_token", loginData.access_token);
        localStorage.setItem("user", JSON.stringify(userData));
      }

      setIsLoading(false);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
      setIsLoading(false);
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
                <i className="bi bi-person-plus-fill display-4 text-success mb-3"></i>
                <h2 className="fw-bold text-white">Create Account</h2>
                <p className="text-white">
                  Join us to build your perfect career path
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label text-light">
                    Full Name
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
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
                    />
                  </div>
                </div>

                <div className="mb-3">
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
                      placeholder="Create a password"
                      required
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

                <div className="mb-4">
                  <label
                    htmlFor="confirmPassword"
                    className="form-label text-light"
                  >
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary">
                      <i className="bi bi-check2-square"></i>
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control bg-dark text-white border-secondary"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      className="btn btn-outline-secondary border-secondary bg-dark text-secondary"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`bi bi-eye${showConfirmPassword ? "-slash" : ""}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 rounded-pill py-3 fw-bold shadow"
                  style={{
                    background: "linear-gradient(90deg, #11998e, #38ef7d)",
                    border: "none",
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating Account...
                    </span>
                  ) : (
                    "Sign Up"
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
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-success fw-bold text-decoration-none"
                  >
                    Log in
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

export default Signup;
