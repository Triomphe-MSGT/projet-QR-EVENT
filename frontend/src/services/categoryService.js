import axios from "axios";

const API_URL = "http://localhost:3000/Categories";

export const getCategories = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Échec de la récupération des categories:", error);
    throw error;
  }
};

export const getCategorieById = async (name) => {
  try {
    const response = await axios.get(`${API_URL}/${name}`);
    return response.data;
  } catch (error) {
    console.error(
      `Échec de la récupération de la categorie avec de nom ${name}:`,
      error
    );
    throw error;
  }
};

export const createCategorie = async (CategorieData) => {
  try {
    const response = await axios.post(API_URL, CategorieData);

    return response.data;
  } catch (error) {
    console.error("Échec de la création de la categorie:", error);
    throw error;
  }
};

export const updateCategorie = async (id, CategorieData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, CategorieData);
    return response.data;
  } catch (error) {
    console.error(
      `Échec de la mise à jour de la categorie avec l'ID ${id}:`,
      error
    );
    throw error;
  }
};

export const deleteCategorie = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(
      `Échec de la suppression de la categorie avec l'ID ${id}:`,
      error
    );
    throw error;
  }
};

export const deleteAllCategories = async () => {
  try {
    await axios.delete(API_URL);
    return true;
  } catch (error) {
    console.error("Échec de la suppression de tous les categorie:", error);
    throw error;
  }
};

export default {
  getCategories,
  createCategorie,
  updateCategorie,
  deleteCategorie,
  getCategorieById,
  deleteAllCategories,
};
