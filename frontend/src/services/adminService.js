// src/services/adminService.js
import api from "../slices/axiosInstance";

// Stats (existant)
export const getAdminStats = async () => {
  try {
    const response = await api.get("/dashboard/admin-stats");
    return response.data;
  } catch (error) {
    console.error("❌ Stats admin:", error);
    throw error;
  }
};

// --- Utilisateurs ---
export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data || [];
  } catch (error) {
    console.error("❌ Get users:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  // userData peut être FormData
  try {
    const config =
      userData instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    const response = await api.post("/users", userData, config);
    return response.data;
  } catch (error) {
    console.error("❌ Create user:", error);
    throw error;
  }
};

export const updateUser = async ({ id, userData }) => {
  // userData peut être FormData
  try {
    if (!id) throw new Error("ID utilisateur manquant");
    const config =
      userData instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    const response = await api.put(`/users/${id}`, userData, config);
    return response.data;
  } catch (error) {
    console.error(`❌ Update user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    if (!id) throw new Error("ID utilisateur manquant");
    await api.delete(`/users/${id}`);
    return id;
  } catch (error) {
    console.error(`❌ Delete user ${id}:`, error);
    throw error;
  }
};
