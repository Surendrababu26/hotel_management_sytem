import React, { useEffect, useState } from "react";
import * as API from "../api/api";
import "./allocation.css";

function AdminAllocation() {
  const [allocations, setAllocations] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingAllocation, setEditingAllocation] = useState(null);

  const [formData, setFormData] = useState({
    student: "",
    room: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allocData, studentsData, roomsData] = await Promise.all([
        API.getAllocations(),
        API.getStudents().catch(() => []),
        API.getRooms().catch(() => [])
      ]);
      setAllocations(allocData);
      setStudentsList(studentsData);
      setRoomsList(roomsData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Are you sure you're logged in as Admin?");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setEditingAllocation(null);
    setFormData({ student: "", room: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (allocation) => {
    setEditingAllocation(allocation);
    setFormData({
      student: allocation.student,
      room: allocation.room,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingAllocation) {
        await API.updateAllocation(editingAllocation.id, formData);
        setSuccess("Allocation updated successfully!");
      } else {
        await API.createAllocation(formData);
        setSuccess("Allocation created successfully!");
      }
      setIsModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(editingAllocation ? "Failed to update allocation." : "Failed to add allocation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this allocation?")) return;
    try {
      await API.deleteAllocation(id);
      setSuccess("Allocation deleted successfully!");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete allocation.");
    }
  };

  return (
    <div className="alloc-container">
      <div className="alloc-header">
        <h2>Room Allocations Management</h2>
        <button className="alloc-btn-primary" onClick={openAddModal}>
          + Add Allocation
        </button>
      </div>

      {error && <div className="alloc-alert alloc-alert-error">{error}</div>}
      {success && <div className="alloc-alert alloc-alert-success">{success}</div>}

      <div className="alloc-card">
        {loading && allocations.length === 0 ? (
          <div className="alloc-empty">Loading allocations...</div>
        ) : (
          <div className="alloc-table-responsive">
            <table className="alloc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student ID</th>
                  <th>Room No.</th>
                  <th>Date Allocated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length > 0 ? (
                  allocations.map((alloc) => (
                    <tr key={alloc.id}>
                      <td>{alloc.id}</td>
                      <td className="alloc-fw-bold">{alloc.student}</td>
                      <td>
                        <span className="alloc-room-badge">{alloc.room}</span>
                      </td>
                      <td className="alloc-date">{alloc.date_allocated}</td>
                      <td className="alloc-actions">
                        <button className="alloc-btn-edit" onClick={() => openEditModal(alloc)}>Edit</button>
                        <button className="alloc-btn-delete" onClick={() => handleDelete(alloc.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="alloc-empty">
                      No allocations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="alloc-modal-overlay">
          <div className="alloc-modal-content">
            <div className="alloc-modal-header">
              <h3>{editingAllocation ? "Edit Allocation" : "New Allocation"}</h3>
              <button className="alloc-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="alloc-form">
              <div className="alloc-form-group">
                <label>Student</label>
                <select name="student" value={formData.student} onChange={handleInputChange} required>
                  <option value="" disabled>Select a student</option>
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>
                  ))}
                </select>
              </div>
              
              <div className="alloc-form-group">
                <label>Room Number</label>
                <select name="room" value={formData.room} onChange={handleInputChange} required>
                  <option value="" disabled>Select a room</option>
                  {roomsList.map(r => (
                    <option key={r.id} value={r.room_number}>
                      {r.room_number} - {r.room_type} {r.available ? '(Available)' : '(Occupied)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="alloc-form-actions">
                <button type="button" className="alloc-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="alloc-btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Submit Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAllocation;
