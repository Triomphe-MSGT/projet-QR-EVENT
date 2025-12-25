// src/services/adminService.js
import api from "../slices/axiosInstance";

/**
 * Fetch admin statistics.
 */
export const getAdminStats = async () => {
  try {
    const response = await api.get("/dashboard/admin-stats");
    return response.data;
  } catch (error) {
    console.error("Admin stats error:", error);
    throw error;
  }
};

// --- Users ---

/**
 * Fetch all users.
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data || [];
  } catch (error) {
    console.error("Get users error:", error);
    throw error;
  }
};

/**
 * Create a new user.
 * @param {object|FormData} userData
 */
export const createUser = async (userData) => {
  try {
    const config =
      userData instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    const response = await api.post("/users", userData, config);
    return response.data;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

/**
 * Update an existing user.
 * @param {object} params - { id, userData }
 */
export const updateUser = async ({ id, userData }) => {
  try {
    if (!id) throw new Error("User ID missing");
    const config =
      userData instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    const response = await api.put(`/users/${id}`, userData, config);
    return response.data;
  } catch (error) {
    console.error(`Update user ${id} error:`, error);
    throw error;
  }
};

/**
 * Delete a user.
 * @param {string} id
 */
export const deleteUser = async (id) => {
  try {
    if (!id) throw new Error("User ID missing");
    await api.delete(`/users/${id}`);
    return id;
  } catch (error) {
    console.error(`Delete user ${id} error:`, error);
    throw error;
  }
};

/**
 * Search for users.
 * @param {string} query
 */
export const searchUsers = async (query) => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await api.get(
      `/users/search?q=${encodeURIComponent(query)}`
    );
    return response.data || [];
  } catch (error) {
    console.error("Search users error:", error);
    return [];
  }
};
