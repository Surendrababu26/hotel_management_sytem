import React, { useEffect, useState } from "react";
import * as API from "../api/api";
import "./allocation.css";

function StudentAllocation() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyAllocation();
  }, []);

  const fetchMyAllocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await API.getMyAllocation();
      setAllocations(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch your allocation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alloc-container">
      <div className="alloc-header">
        <h2>My Room Allocation</h2>
      </div>

      {error && <div className="alloc-alert alloc-alert-error">{error}</div>}

      <div className="alloc-card">
        {loading && allocations.length === 0 ? (
          <div className="alloc-empty">Loading your allocation...</div>
        ) : (
          <div className="alloc-table-responsive">
            <table className="alloc-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Room No.</th>
                  <th>Date Allocated</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length > 0 ? (
                  allocations.map((alloc) => (
                    <tr key={alloc.id || Math.random()}>
                      <td className="alloc-fw-bold">{alloc.student}</td>
                      <td>
                        <span className="alloc-room-badge">{alloc.room}</span>
                      </td>
                      <td className="alloc-date">{alloc.date_allocated}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="alloc-empty">
                      No room has been allocated to you yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentAllocation;
