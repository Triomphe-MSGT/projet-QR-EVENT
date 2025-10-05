import React from 'react'
import { UserCircleIcon } from '@heroicons/react/24/solid'

/**
 * Composant de base pour afficher l'en-tête du profil (Avatar, Nom, Infos).
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.name - Nom de l'utilisateur/organisation.
 * @param {string} props.info - Email ou Rôle (Organisateur/Participant).
 * @param {string} props.avatarUrl - URL de l'image de profil.
 * @param {React.ReactNode} props.children - Les boutons d'action spécifiques (Modifier/Déconnexion).
 */
const ProfileHeader = ({ name, info, avatarUrl, children, role }) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-sm flex flex-col items-center w-full  mb-8'>
      {/* Conteneur de l'Avatar */}
      <div className='relative w-24 h-24 mb-4 rounded-full bg-blue-100 flex items-center justify-center'>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${name} Profile`}
            className='w-full h-full rounded-full object-cover border-4 border-gray-100'
          />
        ) : (
          <UserCircleIcon className='w-20 h-20 text-blue-500' />
        )}
      </div>

      <p className='text-xl font-semibold text-gray-800'>{name}</p>
      <p className='text-sm text-gray-500 mb-2'>{info}</p>

      {/* Afficher le rôle ou une information secondaire si elle est passée */}
      {role && <p className='text-xs text-blue-500 mb-6'>{role}</p>}

      {/* Les enfants (boutons spécifiques comme Modifier ou Déconnexion) sont placés ici */}
      {children}
    </div>
  )
}

export default ProfileHeader
