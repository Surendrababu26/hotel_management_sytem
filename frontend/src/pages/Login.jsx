import React, { useState } from "react";
import { loginUser } from "../api/api";
import { useNavigate } from "react-router-dom";
import "./Login.css";
function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await loginUser(formData);

      setMessage("Login successful");

      navigate("/dashboard");

    } catch (error) {

      setMessage("Invalid username or password");

    }
  };
  return (
  <div className="login-container">
    <div className="login-card">

      <h2>Login</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
          />
        </div>

        <button className="login-btn">
          Login
        </button>

      </form>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        Don't have an account? <a href="/register" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 'bold' }}>Register here</a>
      </div>

    </div>
  </div>
);

  
}

export default Login;