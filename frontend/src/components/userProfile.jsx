import React from 'react'
import { useSelector } from 'react-redux'
import EditProfileForm from '../components/editProfil' // Assurez-vous d'avoir le bon chemin
import { EventDetailsPage } from '../pages/participant/EventDetailsPage' // Liste des événements du participant
import ProfileHeader from './ui/ProfileHeader'

const UserProfile = () => {
  // NOTE IMPORTANTE: Le sélecteur doit correspondre à la clé Redux: state.UserProfile
  const profile = useSelector((state) => state.UserProfile)

  // Déterminer l'URL de l'avatar (utilisé une image par défaut si non trouvé)
  const avatarSource = profile.avatarUrl || 'assets/react.svg'

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col pb-16'>
      <main className='flex-grow p-4 mx-auto w-full max-w-7xl flex flex-col items-center'>
        {/* UTILISATION DU COMPOSANT RÉUTILISABLE PROFILE HEADER */}
        <ProfileHeader
          name={profile.name}
          info={profile.email} // L'email est l'info pour le participant
          avatarUrl={avatarSource}
          // Aucun rôle spécifié ici, car il est le profil par défaut
        />
        {/* L'enfant est le bouton d'édition ou le formulaire */}
        <EditProfileForm />

        {/* Section des Événements (ceux auxquels il est inscrit) */}
        <EventDetailsPage />
      </main>
    </div>
  )
}

export default UserProfile
