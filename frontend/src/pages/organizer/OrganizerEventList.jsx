import React from 'react'
// Icônes professionnelles pour l'édition et la suppression
import { Edit, Trash2, Calendar, MapPin } from 'lucide-react' // Ajout d'icônes pour les détails

/**
 * Composant pour afficher la liste des événements créés par l'organisateur.
 * Inclut des boutons d'action (Éditer, Supprimer) pour chaque événement.
 */
const OrganizerEventList = ({ events }) => {
  // Assurer que 'events' est un tableau, même s'il est null ou undefined
  const eventList = Array.isArray(events) ? events : []
  const eventCount = eventList.length

  const handleEdit = (event) => {
    // Logique pour naviguer vers la page d'édition de l'événement
    console.log("Éditer l'événement:", event.title)
    // Exemple: dispatch(navigateToEditPage(event.id));
  }

  const handleDelete = (event) => {
    // Logique pour demander confirmation puis supprimer l'événement
    console.log("Supprimer l'événement:", event.title)
    // NOTE: Il faudrait un modal de confirmation ici au lieu d'alert/confirm
  }

  /**
   * Fonction pour obtenir une image de substitution avec le texte basé sur les initiales.
   * @param {string} title - Le titre de l'événement.
   * @returns {string} L'URL de l'image de substitution.
   */
  const getPlaceholderImage = (title) => {
    const width = 100
    const height = 100
    const color = '40B8' // Couleur de fond du placeholder (Bleu/Gris)

    let initials = 'E' // Texte par défaut si le titre est vide

    if (title && typeof title === 'string') {
      // Tenter d'obtenir les initiales des deux premiers mots
      const words = title.split(' ').filter((w) => w.length > 0)
      if (words.length >= 2) {
        initials = words[0][0] + words[1][0]
      } else if (words.length === 1) {
        // Si seulement un mot, prendre les 2 premières lettres
        initials = words[0].substring(0, 2)
      } else {
        initials = 'EV' // Par défaut si aucun titre n'est fourni
      }
      initials = initials.toUpperCase()
    }

    return `https://placehold.co/${width}x${height}/40${color}/FFFFFF?text=${initials}`
  }

  return (
    <section className='w-full mb-8'>
      <h2 className='text-xl font-bold text-gray-800 border-b pb-2 mb-4'>
        Événements Créés ({eventCount})
      </h2>

      <div className='space-y-4'>
        {eventCount === 0 ? (
          <div className='text-center text-gray-500 bg-white p-6 rounded-xl shadow-sm'>
            <p>Vous n'avez encore créé aucun événement.</p>
            <button
              // Ajoutez ici le lien vers la page de création d'événement
              className='mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-150'
            >
              + Créer un nouvel événement
            </button>
          </div>
        ) : (
          eventList.map((event, index) => (
            <div
              key={index}
              className='flex items-center bg-white p-3 rounded-xl shadow-md border-l-4 border-blue-500 transition duration-300 hover:shadow-lg'
            >
              {/* Image de l'événement (Petit Carreau) */}
              <div className='flex-shrink-0 mr-4'>
                <img
                  // Utilise event.imageUrl si elle existe, sinon utilise le placeholder
                  src={
                    event.imageUrl ||
                    getPlaceholderImage(event.title || 'Event')
                  }
                  alt={`Image de ${event.title || 'Événement'}`}
                  className='w-16 h-16 object-cover rounded-lg border border-gray-200'
                />
              </div>

              {/* Détails de l'événement */}
              <div className='flex-grow min-w-0'>
                <p className='font-semibold text-lg text-gray-800 truncate mb-1'>
                  {event.title}
                </p>

                <div className='flex flex-col space-y-1 text-sm text-gray-600'>
                  {/* Affichage de la date */}
                  {event.date && (
                    <span className='flex items-center'>
                      <Calendar size={14} className='mr-1 text-blue-500' />
                      {event.date}
                    </span>
                  )}
                  {/* Affichage de la localisation */}
                  {event.location && (
                    <span className='flex items-center'>
                      <MapPin size={14} className='mr-1 text-blue-500' />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions (Édition et Suppression) */}
              <div className='flex space-x-2 ml-4 flex-shrink-0'>
                <button
                  onClick={() => handleEdit(event)}
                  title="Éditer l'événement"
                  className='w-10 h-10 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition duration-150 shadow-sm'
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(event)}
                  title="Supprimer l'événement"
                  className='w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-150 shadow-sm'
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default OrganizerEventList
