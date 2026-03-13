import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import "./Dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.is_staff || user.username === 'admin';
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="dashboard-layout">
      <Sidebar isAdmin={isAdmin} />

      <div className="main-wrapper">
        <TopNav
          user={user}
          isAdmin={isAdmin}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <main className="dashboard-content">
          <div className="content-header">
            <h1 className="dashboard-title">Dashboard Overview</h1>
            <p className="welcome-text">Welcome back, here is your hostel summary.</p>
          </div>

          <div className="dashboard-cards-container">
            <div className="dash-card primary-gradient">
              <div className="card-icon">👨‍🎓</div>
              <div className="card-info">
                <h3>Total Students</h3>
                <h2>142</h2>
              </div>
            </div>

            <div className="dash-card success-gradient">
              <div className="card-icon">🛏️</div>
              <div className="card-info">
                <h3>Available Rooms</h3>
                <h2>28</h2>
              </div>
            </div>

            <div className="dash-card warning-gradient">
              <div className="card-icon">⏳</div>
              <div className="card-info">
                <h3>Pending Allocations</h3>
                <h2>12</h2>
              </div>
            </div>

            <div className="dash-card danger-gradient">
              <div className="card-icon">💳</div>
              <div className="card-info">
                <h3>Pending Payments</h3>
                <h2>₹4,500</h2>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="dashboard-quick-actions" style={{ marginTop: '40px' }}>
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <Link to="/students" className="action-btn">Manage Students</Link>
                <Link to="/rooms" className="action-btn">Manage Rooms</Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;