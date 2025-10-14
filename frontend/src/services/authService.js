import axios from 'axios'

const API_URL = 'http://localhost:3000/users'

export const getUser = async () => {
  try {
    const response = await axios.get(API_URL)
    return response.data
  } catch (error) {
    console.error('Échec de la récupération des événements:', error)
    throw error
  }
}

// export const getEventsByCategory = async (category) => {
//   const { data } = await axios.get(`${API_URL}?type=${category}`);
//   return data;
// };

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error(
      `Échec de la récupération de l'événement avec l'ID ${id}:`,
      error
    )
    throw error
  }
}
export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData)

    return response.data
  } catch (error) {
    console.error("Échec de la création de l'événement:", error)
    throw error
  }
}

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(
      `http://localhost:3000/users/${id}`,
      userData
    )
    return response.data
  } catch (error) {
    console.error(`Échec de la mise à jour de l'événement avec l'ID :`, error)
    throw error
  }
}

export const deleteUser = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`)
    return true
  } catch (error) {
    console.error(`Échec de la suppression de l'événement avec l'ID :`, error)
    throw error
  }
}

export const deleteAllUser = async () => {
  try {
    await axios.delete(API_URL)
    return true
  } catch (error) {
    console.error('Échec de la suppression de tous les événements:', error)
    throw error
  }
}

export default {
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  deleteAllUser,
}
