import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import MyProfile from "./pages/myprofile";
import Rooms from "./pages/Rooms";
import Allocation from "./pages/Allocation";
import Payments from "./pages/Payments";

const AppRoutes = () => {

  return (
    <Routes>

      <Route path="/register" element={<Register />} />

      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/students" element={<Students />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/allocations" element={<Allocation />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/profile" element={<MyProfile />} />

      <Route path="/" element={<Navigate to="/login" />} />

    </Routes>
  );

};

export default AppRoutes;