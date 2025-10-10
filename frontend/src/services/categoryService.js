import axios from "axios";
import api from "../slices/axiosInstance";

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Échec de la récupération des categories:", error);
    throw error;
  }
};

export const getCategorieById = async (name) => {
  try {
    const response = await api.get(`${"/categories"}/${name}`);
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
    const response = await api.post("/categories", CategorieData);

    return response.data;
  } catch (error) {
    console.error("Échec de la création de la categorie:", error);
    throw error;
  }
};

export const updateCategorie = async (id, CategorieData) => {
  try {
    const response = await api.put(`${"/categories"}/${id}`, CategorieData);
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
    await api.delete(`${"/categories"}/${id}`);
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
    await axios.delete("/categories");
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
