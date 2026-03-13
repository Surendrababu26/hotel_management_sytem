import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isAdmin }) => {
    const location = useLocation();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>{isAdmin ? "Hostel Admin" : "Student Portal"}</h2>
            </div>
            <ul className="sidebar-menu">
                <li className={isActive("/dashboard")}>
                    <Link to="/dashboard">
                        <span className="icon">📊</span> Overview
                    </Link>
                </li>
                {isAdmin && (
                    <>
                        <li className={isActive("/students")}>
                            <Link to="/students">
                                <span className="icon">👨‍🎓</span> Students
                            </Link>
                        </li>
                        <li className={isActive("/rooms")}>
                            <Link to="/rooms">
                                <span className="icon">🛏️</span> Rooms
                            </Link>
                        </li>
                        <li className={isActive("/allocations")}>
                            <Link to="/allocations">
                                <span className="icon">📋</span> Allocations
                            </Link>
                        </li>
                    </>
                )}

                {!isAdmin && (
                    <li className={isActive("/allocations")}>
                        <Link to="/allocations">
                            <span className="icon">📋</span> My Allocation
                        </Link>
                    </li>
                )}
                <li className={isActive("/payments")}>
                    <Link to="/payments">
                        <span className="icon">💰</span> Payments
                    </Link>
                </li>
                {!isAdmin && (
                    <li className={isActive("/profile")}>
                        <Link to="/profile">
                            <span className="icon">🧑‍💻</span> Profile
                        </Link>
                    </li>
                )}
                <li>
                    <button onClick={handleLogout} className="logout-sidebar-btn">
                        <span className="icon">🚪</span> Logout
                    </button>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
