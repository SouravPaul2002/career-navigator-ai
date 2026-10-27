import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import apiClient from "../api/apiClient";
import { Modal, Button } from "react-bootstrap";

interface UserProfile {
  id: string;
  name?: string;
  email: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Profile update state
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<UserProfile>("/users/me");
      setProfile(response.data);
      setName(response.data.name || "");
      setEmail(response.data.email || "");
      // Sync local storage
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Failed to load profile:", error);
      setProfileMessage({ type: "danger", text: "Failed to load user profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage(null);

    try {
      const response = await apiClient.put<UserProfile>("/users/me", {
        name: name.trim() || undefined,
        email: email.trim(),
      });
      setProfile(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } }; message?: string };
      setProfileMessage({
        type: "danger",
        text: axiosError.response?.data?.detail || "Failed to update profile.",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "danger", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordMessage({
        type: "danger",
        text: "New password must be at least 8 characters long and contain both letters and numbers.",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await apiClient.post("/users/me/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordMessage({
        type: "success",
        text: response.data.message || "Password changed successfully!",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } }; message?: string };
      setPasswordMessage({
        type: "danger",
        text: axiosError.response?.data?.detail || "Failed to change password. Please verify your old password.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteError(null);

    try {
      await apiClient.delete("/users/me");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      navigate("/signup");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } }; message?: string };
      setDeleteError(axiosError.response?.data?.detail || "Failed to delete account. Please try again.");
      setDeletingAccount(false);
    }
  };

  return (
    <Layout title="Account Settings">
      <div className="container" style={{ maxWidth: "800px" }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading profile...</span>
            </div>
            <p className="mt-2 text-muted">Loading account details...</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4 mb-5">
            {/* Profile Info Card */}
            <div
              className="card shadow-sm border-0 rounded-4"
              style={{ background: "var(--color-card-bg)", color: "var(--color-text)" }}
            >
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="avatar me-3" style={{ width: "48px", height: "48px", fontSize: "1.25rem" }}>
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">Personal Profile</h4>
                    <p className="text-muted small mb-0">Update your name and primary contact email</p>
                  </div>
                </div>

                {profileMessage && (
                  <div className={`alert alert-${profileMessage.type} rounded-3`} role="alert">
                    <i className={`bi ${profileMessage.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}></i>
                    {profileMessage.text}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-3"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      style={{ background: "var(--color-background)", color: "var(--color-text)" }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-lg rounded-3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      style={{ background: "var(--color-background)", color: "var(--color-text)" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 py-2"
                    disabled={updatingProfile}
                  >
                    {updatingProfile ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      "Save Profile Changes"
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Change Password Card */}
            <div
              className="card shadow-sm border-0 rounded-4"
              style={{ background: "var(--color-card-bg)", color: "var(--color-text)" }}
            >
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                    <i className="bi bi-shield-lock-fill fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">Security & Password</h4>
                    <p className="text-muted small mb-0">Change your account password securely</p>
                  </div>
                </div>

                {passwordMessage && (
                  <div className={`alert alert-${passwordMessage.type} rounded-3`} role="alert">
                    <i className={`bi ${passwordMessage.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}></i>
                    {passwordMessage.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Current Password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg rounded-3"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ background: "var(--color-background)", color: "var(--color-text)" }}
                    />
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">New Password</label>
                      <input
                        type="password"
                        className="form-control form-control-lg rounded-3"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="At least 8 chars"
                        style={{ background: "var(--color-background)", color: "var(--color-text)" }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control form-control-lg rounded-3"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Repeat new password"
                        style={{ background: "var(--color-background)", color: "var(--color-text)" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-outline-primary rounded-pill px-4 py-2"
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Danger Zone: Delete Account */}
            <div
              className="card shadow-sm border border-danger border-opacity-25 rounded-4"
              style={{ background: "var(--color-card-bg)", color: "var(--color-text)" }}
            >
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 me-3">
                    <i className="bi bi-trash3-fill fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-danger">Danger Zone</h4>
                    <p className="text-muted small mb-0">Permanently delete your account and all associated data</p>
                  </div>
                </div>

                <p className="text-muted small mb-4">
                  Once deleted, your account, resume analyses, generated roadmaps, and mock interview transcripts
                  cannot be recovered.
                </p>

                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 py-2"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="bi bi-trash3 me-1"></i> Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => !deletingAccount && setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton={!deletingAccount}>
            <Modal.Title className="text-danger fw-bold">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Delete Account
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to permanently delete your account (<strong>{profile?.email}</strong>)?
            </p>
            <p className="text-danger mb-0 small">
              This action is irreversible. All your resume history, roadmaps, and interview sessions will be deleted.
            </p>
            {deleteError && (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                {deleteError}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              className="rounded-pill px-4"
              onClick={() => setShowDeleteModal(false)}
              disabled={deletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="rounded-pill px-4"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
            >
              {deletingAccount ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Deleting...
                </>
              ) : (
                "Yes, Delete My Account"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Layout>
  );
};

export default Profile;
