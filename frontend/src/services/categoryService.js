// src/services/categoryService.js
import api from "../slices/axiosInstance"; // ✅ Assurez-vous que ce chemin est correct

// Récupère toutes les catégories
export const getCategories = async () => {
  try {
    const { data } = await api.get("/categories");
    return data || [];
  } catch (error) {
    console.error("Échec récupération catégories:", error);
    throw error; // Relance l'erreur pour React Query
  }
};

// Récupère une catégorie par son NOM (correspond au backend)
export const getCategoryByName = async (name) => {
  try {
    const response = await api.get(`/categories/name/${name}`);
    return response.data;
  } catch (error) {
    console.error(`Échec récupération catégorie nom ${name}:`, error);
    throw error;
  }
};
// Optionnel: Récupère une catégorie par son ID (si nécessaire)
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/id/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Échec récupération catégorie ID ${id}:`, error);
    throw error;
  }
};

// Crée une nouvelle catégorie
export const createCategory = async (categoryData) => {
  try {
    // categoryData est un objet JSON simple { name, emoji, description }
    const response = await api.post("/categories", categoryData);
    return response.data;
  } catch (error) {
    console.error("Échec création catégorie:", error);
    throw error;
  }
};

// Met à jour une catégorie
export const updateCategory = async ({ id, categoryData }) => {
  // Accepte un objet {id, categoryData}
  try {
    // CORRECTION : Utilisation correcte de l'URL
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Échec màj catégorie ID ${id}:`, error);
    throw error;
  }
};

// Supprime une catégorie
export const deleteCategory = async (id) => {
  try {
    await api.delete(`/categories/${id}`);
    return id; // Retourne l'ID pour la mise à jour du cache
  } catch (error) {
    console.error(`Échec suppression catégorie ID ${id}:`, error);
    throw error;
  }
};

// SUPPRIMÉ : deleteAllCategories n'est pas sûr et n'utilise pas 'api'
// export const deleteAllCategories = async () => { ... };

// Exporte les fonctions utiles
const categoryService = {
  getCategories,
  getCategoryByName,
  getCategoryById, // Exporté si besoin
  createCategory,
  updateCategory,
  deleteCategory,
};
export default categoryService;
