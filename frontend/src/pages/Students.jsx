import React, { useEffect, useState } from "react";
import * as API from "../api/api";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import "./Students.css";
import "./Dashboard.css"; // Reuse dashboard layout styles

function Students() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.is_staff || user.username === 'admin';

  const [students, setStudents] = useState([]);
  const [unlinkedUsers, setUnlinkedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "Male"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchUnlinkedUsers();
  }, []);

  const fetchUnlinkedUsers = async () => {
    try {
      const data = await API.getUnlinkedUsers();
      setUnlinkedUsers(data);
    } catch (err) {
      console.error("Failed to fetch unlinked users", err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await API.getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch students. Ensure backend is running and you have admin access.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ user: "", name: "", email: "", phone: "", address: "", gender: "Male" });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      user: student.user,
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      gender: student.gender || "Male"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingStudent) {
        await API.updateStudent(editingStudent.id, formData);
      } else {
        await API.createStudent(formData);
      }
      setIsModalOpen(false);
      setFormData({ user: "", name: "", email: "", phone: "", address: "", gender: "Male" });
      setEditingStudent(null);
      fetchStudents();
      fetchUnlinkedUsers();
    } catch (err) {
      console.error(err);
      setError(`Failed to ${editingStudent ? 'update' : 'add'} student. Please check input data.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await API.deleteStudent(id);
      fetchStudents();
    } catch (err) {
      console.error(err);
      setError("Failed to delete student.");
    }
  };

  // Filter students based on searchTerm
  const filteredStudents = students.filter(s => {
    const search = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.id.toString().includes(search) ||
      s.phone.includes(search)
    );
  });

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
          <div className="students-container">
            <div className="students-header">
              <div>
                <h2>Students Management</h2>
                {searchTerm && <p style={{ color: '#64748b', marginTop: '5px' }}>Found {filteredStudents.length} results for "{searchTerm}"</p>}
              </div>
              <button className="add-btn" onClick={openAddModal}>
                + Add Student
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-container">
              {loading && students.length === 0 ? (
                <div className="loading">Loading students...</div>
              ) : (
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Gender</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <tr key={s.id}>
                          <td>{s.id}</td>
                          <td className="student-name">{s.name}</td>
                          <td>{s.email}</td>
                          <td>{s.phone}</td>
                          <td>{s.gender}</td>
                          <td className="actions-cell">
                            <button className="edit-btn-sm" onClick={() => openEditModal(s)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(s.id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="empty-state">
                          {searchTerm ? `No matches found for "${searchTerm}"` : "No students found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {isModalOpen && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>{editingStudent ? "Edit Student Details" : "Add New Student"}</h3>
                  <form onSubmit={handleSubmit}>
                    {!editingStudent && (
                      <div className="form-group">
                        <label>Link User Account</label>
                        <select name="user" value={formData.user} onChange={handleInputChange} required>
                          <option value="">-- Select a User --</option>
                          {unlinkedUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                    )}
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
                      <label>Address</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} required></textarea>
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                      <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? "Saving..." : editingStudent ? "Save Changes" : "Save Student"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Students;