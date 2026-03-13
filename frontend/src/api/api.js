const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";


// 🔹 Authorization Header Helper
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};


// REGISTER
export const registerUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/accounts/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};


// LOGIN
export const loginUser = async (loginData) => {
  const response = await fetch(`${BASE_URL}/accounts/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Login failed");
  }

  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  localStorage.setItem("user", JSON.stringify({
    username: data.username,
    is_staff: data.is_staff
  }));

  return data;
};


// REFRESH TOKEN
export const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh_token");

  const response = await fetch(`${BASE_URL}/accounts/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  const data = await response.json();

  localStorage.setItem("access_token", data.access);

  return data;
};

// GET ALL STUDENTS (ADMIN)
export const getStudents = async () => {
  const response = await fetch(`${BASE_URL}/students/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }

  return data;
};

// CREATE STUDENT
export const createStudent = async (studentData) => {
  const response = await fetch(`${BASE_URL}/students/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};


// GET STUDENT BY ID
export const getStudentById = async (id) => {
  const response = await fetch(`${BASE_URL}/students/${id}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  return data;
};

// UPDATE STUDENT
export const updateStudent = async (id, studentData) => {
  const response = await fetch(`${BASE_URL}/students/${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData),
  });

  const data = await response.json();

  return data;
};


// DELETE STUDENT
export const deleteStudent = async (id) => {
  const response = await fetch(`${BASE_URL}/students/${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Delete failed");
  }

  return true;
};

// GET MY PROFILE
export const getMyProfile = async () => {
  const response = await fetch(`${BASE_URL}/students/me/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};

// UPDATE MY PROFILE
export const updateMyProfile = async (profileData) => {
  const response = await fetch(`${BASE_URL}/students/me/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  return data;
};

// GET UNLINKED USERS (ADMIN)
export const getUnlinkedUsers = async () => {
  const response = await fetch(`${BASE_URL}/students/users/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch unlinked users");
  }

  return data;
};

// =======================
// ROOMS API (ADMIN)
// =======================

// GET ALL ROOMS
export const getRooms = async () => {
  const response = await fetch(`${BASE_URL}/rooms/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }

  return data;
};

// CREATE ROOM
export const createRoom = async (roomData) => {
  const response = await fetch(`${BASE_URL}/rooms/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(roomData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};

// GET ROOM BY ID
export const getRoomById = async (id) => {
  const response = await fetch(`${BASE_URL}/rooms/${id}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch room details");
  }

  return data;
};

// UPDATE ROOM
export const updateRoom = async (id, roomData) => {
  const response = await fetch(`${BASE_URL}/rooms/${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(roomData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};

// DELETE ROOM
export const deleteRoom = async (id) => {
  const response = await fetch(`${BASE_URL}/rooms/${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Delete room failed");
  }

  // DRF usually returns 204 No Content for DELETE, so response.json() might fail if empty,
  // but if it returns a message JSON as specified, we can try to parse it.
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    return true; // fallback if no JSON returned
  }
};

// =======================
// ALLOCATIONS API
// =======================

// ADMIN: GET ALL ALLOCATIONS
export const getAllocations = async () => {
  const response = await fetch(`${BASE_URL}/allocations/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};

// ADMIN: CREATE ALLOCATION
export const createAllocation = async (allocationData) => {
  const response = await fetch(`${BASE_URL}/allocations/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(allocationData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};

// ADMIN: GET SINGLE ALLOCATION
export const getAllocationById = async (id) => {
  const response = await fetch(`${BASE_URL}/allocations/${id}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};

// ADMIN: UPDATE ALLOCATION
export const updateAllocation = async (id, allocationData) => {
  const response = await fetch(`${BASE_URL}/allocations/${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(allocationData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};

// ADMIN: DELETE ALLOCATION
export const deleteAllocation = async (id) => {
  const response = await fetch(`${BASE_URL}/allocations/${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Delete allocation failed");

  try {
    const data = await response.json();
    return data;
  } catch (e) {
    return true;
  }
};

// STUDENT: GET MY ALLOCATION
export const getMyAllocation = async () => {
  const response = await fetch(`${BASE_URL}/allocations/my/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};
// =======================
// PAYMENTS API
// =======================

// STUDENT: MAKE PAYMENT
export const makePayment = async (paymentData) => {
  const response = await fetch(`${BASE_URL}/payments/pay/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};

// STUDENT/ADMIN: GET PAYMENT STATUS
export const getPaymentStatus = async (studentId, month, year) => {
  const response = await fetch(`${BASE_URL}/payments/status/${studentId}/${month}/${year}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};

// STUDENT/ADMIN: GET PENDING MONTHS
export const getPendingMonths = async (studentId) => {
  const response = await fetch(`${BASE_URL}/payments/pending/${studentId}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};

// ADMIN: GET LIST OF PAID TRANSACTIONS
export const getAllPayments = async () => {
  const response = await fetch(`${BASE_URL}/payments/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};

// ADMIN: GET TOTAL REVENUE
export const getTotalRevenue = async () => {
  const response = await fetch(`${BASE_URL}/payments/total-revenue/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};

// ADMIN: GET STUDENT PAYMENT STATUS OVERVIEW
export const getStudentPaymentStatusOverview = async () => {
  const response = await fetch(`${BASE_URL}/payments/admin/student-payment-status/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
};
