// src/services/categoryService.js
import api from "../slices/axiosInstance";

/**
 * Fetch all categories.
 */
export const getCategories = async () => {
  try {
    const { data } = await api.get("/categories");
    return data || [];
  } catch (error) {
    console.error("Fetch categories failed:", error);
    throw error;
  }
};

/**
 * Fetch category by name.
 * @param {string} name
 */
export const getCategoryByName = async (name) => {
  try {
    const response = await api.get(`/categories/name/${name}`);
    return response.data;
  } catch (error) {
    console.error(`Fetch category by name ${name} failed:`, error);
    throw error;
  }
};

/**
 * Fetch category by ID.
 * @param {string} id
 */
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/id/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Fetch category by ID ${id} failed:`, error);
    throw error;
  }
};

/**
 * Create a new category.
 * @param {object} categoryData - { name, emoji, description }
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post("/categories", categoryData);
    return response.data;
  } catch (error) {
    console.error("Create category failed:", error);
    throw error;
  }
};

/**
 * Update a category.
 * @param {object} params - { id, categoryData }
 */
export const updateCategory = async ({ id, categoryData }) => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Update category ID ${id} failed:`, error);
    throw error;
  }
};

/**
 * Delete a category.
 * @param {string} id
 */
export const deleteCategory = async (id) => {
  try {
    await api.delete(`/categories/${id}`);
    return id;
  } catch (error) {
    console.error(`Delete category ID ${id} failed:`, error);
    throw error;
  }
};

const categoryService = {
  getCategories,
  getCategoryByName,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
export default categoryService;
