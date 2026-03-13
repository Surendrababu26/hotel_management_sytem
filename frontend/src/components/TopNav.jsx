import React from "react";

const TopNav = ({ user, isAdmin, searchTerm, onSearchChange }) => {
    return (
        <header className="top-nav">
            <div className="nav-search">
                <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="nav-profile">
                <div className="avatar">
                    {isAdmin ? "A" : user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
                <span>{isAdmin ? "Admin" : user?.username}</span>
            </div>
        </header>
    );
};

export default TopNav;
