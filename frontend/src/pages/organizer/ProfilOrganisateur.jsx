import React from 'react'
import { useSelector } from 'react-redux'
import ProfileHeader from '../../components/ui/ProfileHeader'

import OrganizerEventList from './OrganizerEventList' // Composant à créer pour la liste d'événements de l'organisateur

// Composant pour le bouton de bascule vers le mode Participant
const SwitchModeButton = () => (
  <button className='text-blue-500 font-semibold py-2 px-6 rounded-full transition duration-150 flex items-center justify-center mb-6'>
    <span className='mr-1'>✏️</span> Passer en mode Participant
  </button>
)

// Composant pour le bouton de déconnexion (couleur rouge vue dans la capture)
const LogoutButton = () => (
  <button
    // NOTE: Ajoutez ici la logique de déconnexion (ex: onClick={handleLogout})
    className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition duration-150 shadow-md mt-4'
  >
    Se déconnecter
  </button>
)

const OrganizerProfile = () => {
  // Réutilise le même état Redux 'UserProfile' (comme vous l'avez spécifié)
  const profile = useSelector((state) => state.UserProfile)

  const avatarSource = profile.avatarUrl || 'assets/react.svg'

  // Simuler les événements CRÉÉS par l'organisateur (vous devrez charger ces données)
  const organizerEvents = profile.eventsCreated || [
    { title: 'Conférence sur l’IA', date: 'Le 15 septembre 2025' },
    { title: 'Soutenance sur le Big Data', date: 'Le 20 septembre 2025' },
  ]

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col pb-16'>
      <main className='flex-grow p-4 mx-auto w-full max-w-7xl flex flex-col items-center'>
        {/* UTILISATION DU COMPOSANT RÉUTILISABLE PROFILE HEADER */}
        <ProfileHeader
          name={profile.name}
          info='Organisateur' // Le rôle est l'info secondaire
          role={null} // Ne pas utiliser la prop role ici, car info suffit
          avatarUrl={avatarSource}
        >
          {/* L'enfant est le bouton de changement de mode */}
          <SwitchModeButton />
        </ProfileHeader>

        {/* Liste des événements CRÉÉS par l'organisateur (Similaire à EventDetailsPage, mais avec des actions d'édition/suppression) */}
        <OrganizerEventList events={organizerEvents} />

        {/* Bouton de Déconnexion qui s'étend sur la largeur */}
        <LogoutButton />
      </main>
    </div>
  )
}

export default OrganizerProfile
