import axios from 'axios'

const API_URL = 'http://localhost:3000' // URL de ton json-server

// 🔹 Statistiques globales
export const getDashboardStats = async () => {
  const { data: events } = await axios.get(`${API_URL}/events`)

  const totalEvents = events.length
  const totalRegistrations = events.reduce(
    (sum, e) => sum + (e.participantsCount || 0),
    0
  )
  const qrValidated = events.filter((e) => e.uniqueQr === true).length
  const avgPerEvent =
    totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : 0

  return { totalEvents, totalRegistrations, qrValidated, avgPerEvent }
}

// 🔹 Événements par catégorie
export const getEventsByCategory = async () => {
  const { data: events } = await axios.get(`${API_URL}/events`)

  // Compte le nombre d’événements par type
  const counts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

// 🔹 Villes les plus populaires
export const getTopCities = async () => {
  const { data: events } = await axios.get(`${API_URL}/events`)

  const counts = events.reduce((acc, e) => {
    acc[e.localisation] = (acc[e.localisation] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).map(([city, value]) => ({ city, value }))
}

// 🔹 Événements les plus populaires
export const getPopularEvents = async () => {
  const { data: events } = await axios.get(`${API_URL}/events`)
  // Trie par nombre de participants décroissant
  return events
    .sort((a, b) => (b.participantsCount || 0) - (a.participantsCount || 0))
    .slice(0, 5)
}

// 🔹 Derniers événements créés
export const getRecentEvents = async () => {
  const { data: events } = await axios.get(`${API_URL}/events`)

  // Trie par date de début
  return events
    .sort((a, b) => new Date(b.debut) - new Date(a.debut))
    .slice(0, 5)
}
