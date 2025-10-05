// EventDetailsPage.jsx (Mise à jour pour que les événements prennent toute la largeur)

import { useSelector } from 'react-redux'

/**
 * Fonction de hachage simple pour obtenir un indice de couleur basé sur une chaîne.
 */
const getHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

/**
 * Définit un ensemble de palettes de couleurs.
 */
const colorPalettes = [
  { bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
  { bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
  { bgColor: 'bg-rose-100', textColor: 'text-rose-700' },
  { bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
]

/**
 * Fonction pour extraire le tag et déterminer les classes de couleur de manière générique.
 */
const getEventTagAndColor = (title) => {
  if (!title) {
    return { tag: 'EVT', bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
  }

  const firstWord = title.split(/\s+/)[0]
  const tag = firstWord.substring(0, 4).toUpperCase()

  const hash = getHash(title)
  const colorIndex = Math.abs(hash) % colorPalettes.length

  return { tag, ...colorPalettes[colorIndex] }
}

export const EventDetailsPage = () => {
  const profile = useSelector((state) => state.userProfile)
  return (
    // CLASSE MODIFIÉE : 'w-full' est conservé, mais 'max-w-sm mx-auto' est supprimé.
    // Le conteneur prendra maintenant toute la largeur définie par son parent (main).
    <div className='w-full'>
      <h3 className='text-lg font-bold text-gray-700 mb-3 ml-1'>
        Mes événements
      </h3>

      {profile?.events?.length > 0 ? (
        <div className='space-y-4'>
          {profile.events.map((event, index) => {
            const { tag, bgColor, textColor } = getEventTagAndColor(event.title)

            return (
              <div
                key={index}
                className='flex items-center bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition duration-200'
              >
                {/* Bloc coloré avec le mot-clé généré */}
                <div
                  className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center mr-4 
                    ${bgColor} ${textColor} font-semibold text-xs leading-none`}
                >
                  <span className='text-center'>{tag}</span>
                </div>

                {/* Détails de l'événement */}
                <div className='flex flex-col'>
                  <p className='font-semibold text-gray-800 text-base'>
                    {event.title}
                  </p>
                  <span className='text-gray-500 text-sm'>{event.date}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className='text-gray-500 p-4 bg-white rounded-xl shadow-sm'>
          Vous n'avez participé à aucun événement pour le moment.
        </p>
      )}
    </div>
  )
}
