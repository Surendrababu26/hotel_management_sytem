import React, { useEffect, useState } from "react";
import * as API from "../api/api";
import "./MyProfile.css";

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.is_staff || user.username === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      loadProfile();
    }
  }, [isAdmin]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await API.getMyProfile();
      setProfile(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        gender: data.gender
      });
    } catch (err) {
      console.error("Error loading profile", err);
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.detail || "Could not load profile.");
      } catch (e) {
        setError("Could not load profile. Ensure you are logged in as a student.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await API.updateMyProfile(formData);
      setProfile(data);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="profile-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="header-info">
            <h2>{profile?.name || "User Profile"}</h2>
            <p className="subtitle">Student Portal</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-content">
          {isAdmin ? (
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Username</span>
                <span className="info-value">{user.username}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="info-value">Administrator</span>
              </div>
              <p className="admin-notice">Admin accounts do not have student profile details.</p>
            </div>
          ) : profile && !isEditing ? (
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{profile.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{profile.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{profile.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Gender</span>
                <span className="info-value">{profile.gender}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Address</span>
                <span className="info-value">{profile.address}</span>
              </div>
              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : profile && isEditing ? (
            <form className="edit-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} required></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="empty-state">
              {loading ? "Loading..." : "No profile data available."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProfile;