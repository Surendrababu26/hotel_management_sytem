import React, { useEffect, useState } from "react";
import * as API from "../api/api";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import "./Rooms.css";
import "./Dashboard.css"; // Reuse dashboard layout styles

function Rooms() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.is_staff || user.username === 'admin';

  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit State
  const [editingRoom, setEditingRoom] = useState(null);

  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "single",
    capacity: 1,
    available: true
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await API.getRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch rooms. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      room_number: "",
      room_type: "single",
      capacity: 1,
      available: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity,
      available: room.available
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingRoom) {
        await API.updateRoom(editingRoom.id, formData);
        setSuccess("Room updated successfully!");
      } else {
        await API.createRoom(formData);
        setSuccess("Room created successfully!");
      }
      setIsModalOpen(false);
      fetchRooms();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(editingRoom ? "Failed to update room." : "Failed to add room.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await API.deleteRoom(id);
      setSuccess("Room deleted successfully!");
      fetchRooms();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete room.");
    }
  };

  // Filter rooms based on searchTerm
  const filteredRooms = rooms.filter(room => {
    const search = searchTerm.toLowerCase();
    return (
      room.room_number.toLowerCase().includes(search) ||
      room.room_type.toLowerCase().includes(search) ||
      room.id.toString().includes(search) ||
      (room.available ? "available" : "occupied").includes(search)
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
          <div className="rooms-container" style={{ padding: '0 40px' }}>
            <div className="rooms-header">
              <div>
                <h2>Rooms Management</h2>
                {searchTerm && <p style={{ color: '#64748b', marginTop: '5px' }}>Found {filteredRooms.length} results for "{searchTerm}"</p>}
              </div>
              <button className="add-btn" onClick={openAddModal}>
                + Add Room
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="table-container">
              {loading && rooms.length === 0 ? (
                <div className="loading">Loading rooms...</div>
              ) : (
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Room No.</th>
                      <th>Type</th>
                      <th>Capacity</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <tr key={room.id}>
                          <td>{room.id}</td>
                          <td className="fw-bold">{room.room_number}</td>
                          <td className="capitalize">{room.room_type}</td>
                          <td>{room.capacity}</td>
                          <td>
                            <span className={`status-badge ${room.available ? 'available' : 'unavailable'}`}>
                              {room.available ? "Available" : "Occupied"}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button className="edit-btn" onClick={() => openEditModal(room)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(room.id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="empty-state">
                          {searchTerm ? `No matches found for "${searchTerm}"` : "No rooms found."}
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
                  <h3>{editingRoom ? "Edit Room" : "Add New Room"}</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Room Number</label>
                      <input
                        type="text"
                        name="room_number"
                        value={formData.room_number}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Room Type</label>
                        <select name="room_type" value={formData.room_type} onChange={handleInputChange}>
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="triple">Triple</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Capacity</label>
                        <input
                          type="number"
                          name="capacity"
                          min="1"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="available"
                          checked={formData.available}
                          onChange={handleInputChange}
                        />
                        <span>Is Room Available?</span>
                      </label>
                    </div>

                    <div className="modal-actions">
                      <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                      <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? "Saving..." : editingRoom ? "Update Room" : "Save Room"}
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

export default Rooms;
