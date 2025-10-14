// LiveManagementPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'

import { getEventById } from '../../services/eventService'
import { setCurrentEvent } from '../../slices/eventSlice'
import { useUpdateEvent } from '../../hooks/useEvents'

const EditEvent = () => {
  const { id } = useParams()
  console.log('ID récupéré depuis useParams:', id)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    debut: '',
    fin: '',
    localisation: '',
  })

  const currentEvent = useSelector((state) => state.events.currentEvent)

  useEffect(() => {
    if (currentEvent) {
      setFormData({
        name: currentEvent.name || '',
        debut: currentEvent.debut || '',
        fin: currentEvent.fin || '',
        localisation: currentEvent.localisation || '',
      })
    }
  }, [currentEvent])
  // 1️⃣ Récupération des données avec React Query
  const {
    data: eventData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
    onSuccess: (data) => {
      setFormData({
        name: data.name,
        debut: data.debut,
        fin: data.fin,
        localisation: data.localisation,
      })
      dispatch(setCurrentEvent(data))
    },
  })

  const updateMutation = useUpdateEvent()

  // 2️⃣ Gestion du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          alert('Événement mis à jour !')
          navigate('/dashboard') // Retour à la liste
        },
        onError: (error) => {
          alert('Impossible de mettre à jour l’événement')
        },
      }
    )
  }

  if (isLoading) return <p>Chargement...</p>
  if (isError) return <p>Impossible de charger l’événement</p>

  return (
    <div className='max-w-xl mx-auto p-6 bg-white rounded shadow mt-8'>
      <h2 className='text-xl font-bold mb-4'>Modifier l'événement</h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          type='text'
          name='name'
          value={formData.name}
          onChange={handleChange}
          placeholder="Nom de l'événement"
          className='w-full border px-3 py-2 rounded'
          required
        />
        <input
          type='date'
          name='debut'
          value={formData.debut}
          onChange={handleChange}
          className='w-full border px-3 py-2 rounded'
          required
        />
        <input
          type='date'
          name='fin'
          value={formData.fin}
          onChange={handleChange}
          className='w-full border px-3 py-2 rounded'
          required
        />
        <input
          type='text'
          name='localisation'
          value={formData.localisation}
          onChange={handleChange}
          placeholder='Lieu'
          className='w-full border px-3 py-2 rounded'
          required
        />
        <button
          type='submit'
          className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition'
        >
          Enregistrer
        </button>
      </form>
    </div>
  )
}

export default EditEvent
