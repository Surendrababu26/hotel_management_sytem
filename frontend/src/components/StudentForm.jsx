import React, { useState } from "react";
import API from "../api/api";

function StudentForm() {

  const [form, setForm] = useState({
    user: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "Male",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/students/", form);
      alert("Student created successfully");
      console.log(res.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <input
        name="user"
        placeholder="User ID"
        onChange={handleChange}
      />

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <input
        name="phone"
        placeholder="Phone"
        onChange={handleChange}
      />

      <input
        name="address"
        placeholder="Address"
        onChange={handleChange}
      />

      <select name="gender" onChange={handleChange}>
        <option>Male</option>
        <option>Female</option>
      </select>

      <button type="submit">Create Student</button>

    </form>
  );
}

export default StudentForm;