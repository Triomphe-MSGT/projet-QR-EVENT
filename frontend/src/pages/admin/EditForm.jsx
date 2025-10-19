// EditProfileForm.js (Corrigé pour le dimensionnement du formulaire)

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateName, updateEmail, } from '../services/userProfile'

const EditProfileForm = () => {
  const dispatch = useDispatch()
  const profile = useSelector((state) => state.userProfile)

  const [isFormVisible, setIsFormVisible] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setEmail(profile.email || '')
    }
  }, [profile])

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch(updateName(name))
    dispatch(updateEmail(email))
    alert('Profil mis à jour !')
    setIsFormVisible(false)
  }

  // Rendu du bouton initial
  if (!isFormVisible) {
    return (
      <button
        onClick={() => setIsFormVisible(true)}
        className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition duration-200'
      >
        Modifier le profil
      </button>
    )
  }

  // Rendu du formulaire visible
  return (
    <form
      onSubmit={handleSubmit}
      className='p-4 border border-gray-200 rounded-lg shadow-inner mt-4 space-y-3 w-full max-w-sm mx-auto'
    >
      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
        Éditer le Profil
      </h3>

      {/* Champ Nom (Input prend w-full) */}
      <div className='flex flex-col space-y-1'>
        <label className='text-sm font-medium text-gray-700'>Nom:</label>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          // AJOUT: w-full pour que l'input remplisse le conteneur du formulaire
          className='w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

      {/* Champ Email (Input prend w-full) */}
      <div className='flex flex-col space-y-1'>
        <label className='text-sm font-medium text-gray-700'>Email:</label>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          // AJOUT: w-full pour que l'input remplisse le conteneur du formulaire
          className='w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

       <div className='flex flex-col space-y-1'>
        <label className='text-sm font-medium text-gray-700'>role</label>
        <input
          type='text'
          value={role}
          onChange={(e) => setRole(e.target.value)}
          // AJOUT: w-full pour que l'input remplisse le conteneur du formulaire
          className='w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>


      {/* Boutons d'action (flex-1 pour répartition égale) */}
      <div className='flex gap-2 pt-2'>
        <button
          type='submit'
          className='flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200'
        >
          Mettre à jour
        </button>
        <button
          type='button'
          onClick={() => setIsFormVisible(false)} // Bouton Annuler
          className='flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition duration-200'
        >
          Annuler
        </button>
      </div>
    </form>
  )
}

export default EditProfileForm  