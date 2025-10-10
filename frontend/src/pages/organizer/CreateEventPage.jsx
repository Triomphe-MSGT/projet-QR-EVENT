import { useState } from 'react'
import { useCreateEvent } from '../../hooks/useEvents'
import MainLayout from '../../components/layouts/MainLayout'
import { Navigate, useNavigate } from 'react-router-dom'

const EventForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    debut: '',
    fin: '',
    time: '',
    localisation: '',
    description: '',
    price: '',
    qrReason: '',
    uniqueQr: false,
    image: null,
  })

  const createEventMutation = useCreateEvent()

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.type || !formData.date) {
      alert('Veuillez remplir les champs obligatoires !')
      return
    }

    const eventToSend = {
      ...formData,
      image: formData.image ? formData.image.name : null,
    }

    createEventMutation.mutate(eventToSend, {
      onSuccess: () => {
        alert('Événement créé !')
        setFormData({
          name: '',
          type: '',
          debut: '',
          fin: '',
          time: '',
          localisation: '',
          description: '',
          price: '',
          qrReason: '',
          uniqueQr: false,
          image: null,
        })
      },
    })
    navigate('/dashboard')
  }

  return (
    <MainLayout>
      <div className='max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-2xl font-semibold mb-6'>
          Créer un nouvel événement
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Nom */}
          <div>
            <label className='block text-sm font-medium mb-1'>
              Nom de l'événement
            </label>
            <input
              type='text'
              name='name'
              placeholder="Conférence sur l'IA"
              value={formData.name}
              onChange={handleChange}
              required
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>

          {/* Type */}
          <div>
            <label className='block text-sm font-medium mb-1'>
              Type d'événement
            </label>
            <select
              name='type'
              value={formData.type}
              onChange={handleChange}
              required
              className='w-full border rounded-lg px-3 py-2'
            >
              <option value=''>Sélectionner un type</option>
              <option value='conference'>Conférence</option>
              <option value='atelier'>Atelier</option>
              <option value='concert'>Concert</option>
            </select>
          </div>

          {/* Date & Heure */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Date</label>
              <input
                type='date'
                name='debut'
                value={formData.debut}
                onChange={handleChange}
                required
                className='w-full border rounded-lg px-3 py-2'
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>Date</label>
              <input
                type='date'
                name='fin'
                value={formData.fin}
                onChange={handleChange}
                required
                className='w-full border rounded-lg px-3 py-2'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Heure</label>
              <input
                type='time'
                name='time'
                value={formData.time}
                onChange={handleChange}
                className='w-full border rounded-lg px-3 py-2'
              />
            </div>
          </div>

          {/* Lieu */}
          <div>
            <label className='block text-sm font-medium mb-1'>Lieu</label>
            <input
              type='text'
              name='localisation'
              placeholder='Centre de congrès XYZ'
              value={formData.localisation}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium mb-1'>
              Description
            </label>
            <textarea
              name='description'
              placeholder='Décrivez votre événement...'
              value={formData.description}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>

          {/* Prix */}
          <div>
            <label className='block text-sm font-medium mb-1'>
              Prix du billet (en FCFA)
            </label>
            <input
              type='number'
              name='price'
              placeholder='Optionnel'
              value={formData.price}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>

          {/* QR Code */}
          <div>
            <label className='block text-sm font-medium mb-1'>
              Raison du QR Code
            </label>
            <select
              name='qrReason'
              value={formData.qrReason}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            >
              <option value=''>Sélectionner une raison</option>
              <option value='acces'>Accès</option>
              <option value='billet'>Billet</option>
            </select>
          </div>

          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              name='uniqueQr'
              checked={formData.uniqueQr}
              onChange={handleChange}
              className='h-4 w-4'
            />
            <label className='text-sm'>Générer un QR code unique</label>
          </div>

          {/* Image */}
          <div>
            <label className='block text-sm font-medium mb-1'>
              Image de l'événement
            </label>
            <input
              type='file'
              name='image'
              onChange={handleChange}
              className='w-full text-sm'
            />
          </div>

          {/* Submit */}
          <div>
            <button
              type='submit'
              disabled={createEventMutation.isLoading}
              className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition'
            >
              {createEventMutation.isLoading
                ? 'Création en cours...'
                : "Créer l'événement"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default EventForm
