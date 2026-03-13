import React, { useEffect, useState } from "react";
import * as API from "../api/api";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import "./Payments.css";
import "./Dashboard.css"; // Reuse sidebar styles

function Payments() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const isAdmin = user.is_staff || user.username === 'admin';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Student States
    const [myProfile, setMyProfile] = useState(null);
    const [pendingMonths, setPendingMonths] = useState([]);
    const [paymentForm, setPaymentForm] = useState({
        month: "",
        year: new Date().getFullYear(),
        amount: 5000,
        payment_method: "UPI"
    });

    // Admin States
    const [allTransactions, setAllTransactions] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [studentStatusOverview, setStudentStatusOverview] = useState([]);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [adminFormData, setAdminFormData] = useState({
        student: "",
        month: "",
        year: new Date().getFullYear(),
        amount: 5000,
        payment_method: "UPI"
    });
    const [studentsList, setStudentsList] = useState([]);

    useEffect(() => {
        if (isAdmin) {
            fetchAdminData();
        } else {
            fetchStudentData();
        }
    }, [isAdmin]);

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            const profile = await API.getMyProfile();
            setMyProfile(profile);
            if (profile && profile.id) {
                const pending = await API.getPendingMonths(profile.id);
                setPendingMonths(pending.pending_months || []);
            }
        } catch (err) {
            console.error(err);
            try {
                const parsed = JSON.parse(err.message);
                setError(parsed.detail || "Failed to fetch payment data.");
            } catch (e) {
                setError("Failed to fetch payment data.");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [transactions, revenue, overview, allStudents] = await Promise.all([
                API.getAllPayments(),
                API.getTotalRevenue(),
                API.getStudentPaymentStatusOverview(),
                API.getStudents()
            ]);
            setAllTransactions(transactions);
            setTotalRevenue(revenue.total_revenue);
            setStudentStatusOverview(overview);
            setStudentsList(allStudents);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch admin dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAdminInputChange = (e) => {
        const { name, value } = e.target;
        setAdminFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const result = await API.makePayment(paymentForm);
            setSuccess(`Payment of ₹${result.amount} for ${result.month} successful!`);
            fetchStudentData(); // Refresh data
        } catch (err) {
            console.error(err);
            try {
                const parsed = JSON.parse(err.message);
                setError(parsed.non_field_errors ? parsed.non_field_errors[0] : "Payment failed.");
            } catch (e) {
                setError("Payment failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAdminPaymentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const result = await API.makePayment(adminFormData);
            setSuccess(`Admin: Payment of ₹${result.amount} for Student ID ${result.student} successful!`);
            setIsAdminModalOpen(false);
            fetchAdminData();
        } catch (err) {
            console.error(err);
            setError("Admin failed to record payment.");
        } finally {
            setLoading(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Filtering logic
    const filteredTransactions = allTransactions.filter(t => {
        const search = searchTerm.toLowerCase();
        return (
            t.id.toString().includes(search) ||
            t.student.toString().includes(search) ||
            t.month.toLowerCase().includes(search) ||
            t.amount.toString().includes(search) ||
            t.payment_method.toLowerCase().includes(search) ||
            (t.status && t.status.toLowerCase().includes(search))
        );
    });

    const filteredStudentStatus = studentStatusOverview.filter(s => {
        const search = searchTerm.toLowerCase();
        return (
            s.student_name.toLowerCase().includes(search) ||
            s.email.toLowerCase().includes(search) ||
            s.student_id.toString().includes(search) ||
            s.status.toLowerCase().includes(search)
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
                    <div className="payments-container">
                        <div className="payments-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1>Payments Dashboard</h1>
                                <p>Manage and track all hostel-related transactions.</p>
                            </div>
                            {isAdmin && (
                                <button className="pay-btn" onClick={() => setIsAdminModalOpen(true)} style={{ marginTop: 0 }}>
                                    + Record Payment
                                </button>
                            )}
                        </div>

                        {error && <div className="alloc-alert alloc-alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
                        {success && <div className="alloc-alert alloc-alert-success" style={{ marginBottom: '20px' }}>{success}</div>}

                        {isAdmin ? (
                            /* ADMIN VIEW */
                            <div className="payments-grid">
                                {/* Revenue Card */}
                                <div className="payment-card revenue-card">
                                    <div className="card-title">
                                        <span className="icon">📈</span> Total Revenue
                                    </div>
                                    <div className="revenue-amount">
                                        <span>₹</span>{totalRevenue.toLocaleString()}
                                    </div>
                                </div>

                                {/* All Transactions */}
                                <div className="payment-card" style={{ gridColumn: "1 / -1" }}>
                                    <div className="card-title">
                                        <span className="icon">📜</span> Recent Transactions (PAID) {searchTerm && ` - Filtered: ${filteredTransactions.length} results`}
                                    </div>
                                    <div className="transaction-table-container">
                                        <table className="transaction-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Student ID</th>
                                                    <th>Month</th>
                                                    <th>Amount</th>
                                                    <th>Method</th>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredTransactions.map(t => (
                                                    <tr key={t.id}>
                                                        <td>{t.id}</td>
                                                        <td>{t.student}</td>
                                                        <td>{t.month} {t.year}</td>
                                                        <td>₹{t.amount}</td>
                                                        <td>{t.payment_method}</td>
                                                        <td>{new Date(t.payment_date).toLocaleDateString()}</td>
                                                        <td><span className="status-indicator paid">{t.status}</span></td>
                                                    </tr>
                                                ))}
                                                {filteredTransactions.length === 0 && (
                                                    <tr>
                                                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                                            No matching transactions found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Student Status Overview */}
                                <div className="payment-card" style={{ gridColumn: "1 / -1" }}>
                                    <div className="card-title">
                                        <span className="icon">👥</span> Student Payment Status {searchTerm && ` - Filtered: ${filteredStudentStatus.length} results`}
                                    </div>
                                    <div className="transaction-table-container">
                                        <table className="transaction-table">
                                            <thead>
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Email</th>
                                                    <th>Paid Months</th>
                                                    <th>Unpaid Months</th>
                                                    <th>Overall Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredStudentStatus.map(s => (
                                                    <tr key={s.student_id}>
                                                        <td className="fw-bold">{s.student_name}</td>
                                                        <td>{s.email}</td>
                                                        <td>
                                                            <div className="status-list" style={{ gap: '4px' }}>
                                                                {s.paid_months.length > 0 ? (
                                                                    s.paid_months.map(m => (
                                                                        <span key={m} className="month-badge paid" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>{m}</span>
                                                                    ))
                                                                ) : (
                                                                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>None</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="status-list" style={{ gap: '4px' }}>
                                                                {s.unpaid_months.length > 0 ? (
                                                                    s.unpaid_months.map(m => (
                                                                        <span key={m} className="month-badge pending" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>{m}</span>
                                                                    ))
                                                                ) : (
                                                                    <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.8rem' }}>Fully Paid</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${s.status === 'PAID' ? 'available' : 'unavailable'}`}>
                                                                {s.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredStudentStatus.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                                            No matching students found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* STUDENT VIEW */
                            <div className="payments-grid">
                                {/* Payment Form */}
                                <div className="payment-card">
                                    <div className="card-title">
                                        <span className="icon">💸</span> Make a Payment
                                    </div>
                                    <form className="payment-form" onSubmit={handlePaymentSubmit}>
                                        <div className="form-group">
                                            <label>Select Month</label>
                                            <select name="month" value={paymentForm.month} onChange={handleInputChange} required>
                                                <option value="">-- Choose Month --</option>
                                                {months.map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Year</label>
                                            <input type="number" name="year" value={paymentForm.year} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Amount (₹)</label>
                                            <input type="number" name="amount" value={paymentForm.amount} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Method</label>
                                            <select name="payment_method" value={paymentForm.payment_method} onChange={handleInputChange}>
                                                <option value="UPI">UPI</option>
                                                <option value="CARD">Card</option>
                                                <option value="CASH">Cash</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="pay-btn" disabled={loading}>
                                            {loading ? "Processing..." : "Pay Now"}
                                        </button>
                                    </form>
                                </div>

                                {/* Pending Months */}
                                <div className="payment-card">
                                    <div className="card-title">
                                        <span className="icon">⏳</span> Pending Months
                                    </div>
                                    <div className="status-list">
                                        {pendingMonths.length > 0 ? (
                                            pendingMonths.map(m => (
                                                <span key={m} className="month-badge pending">{m}</span>
                                            ))
                                        ) : (
                                            <p>All dues cleared! Great job.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ADMIN RECORD PAYMENT MODAL */}
            {isAdminModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="alloc-modal-header">
                            <h3>Record Student Payment</h3>
                            <button className="alloc-modal-close" onClick={() => setIsAdminModalOpen(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleAdminPaymentSubmit} className="payment-form" style={{ marginTop: '20px' }}>
                            <div className="form-group">
                                <label>Select Student</label>
                                <select name="student" value={adminFormData.student} onChange={handleAdminInputChange} required>
                                    <option value="">-- Choose Student --</option>
                                    {studentsList.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Month</label>
                                <select name="month" value={adminFormData.month} onChange={handleAdminInputChange} required>
                                    <option value="">-- Choose Month --</option>
                                    {months.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <input type="number" name="year" value={adminFormData.year} onChange={handleAdminInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input type="number" name="amount" value={adminFormData.amount} onChange={handleAdminInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select name="payment_method" value={adminFormData.payment_method} onChange={handleAdminInputChange}>
                                    <option value="UPI">UPI</option>
                                    <option value="CARD">Card</option>
                                    <option value="CASH">Cash</option>
                                </select>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button type="button" className="cancel-btn" onClick={() => setIsAdminModalOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn" disabled={loading} style={{ flex: 1 }}>
                                    {loading ? "Processing..." : "Record Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Payments;
