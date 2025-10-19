import { Edit } from 'lucide-react'
import React, { useState, useEffect } from 'react'

const EditForm = ({
  title = 'Modifier',
  fields = [],
  initialData = {},
  onSubmit,
  onCancel,
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [formData, setFormData] = useState(initialData)

  // Met à jour les données initiales quand elles changent
  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) onSubmit(formData)
    setIsFormVisible(false)
  }

  if (!isFormVisible) {
    return (
      <button
        onClick={() => setIsFormVisible(true)}
        className='bg-white-500 hover:bg-blue-600 text-blue font-semibold py-2 px-6 rounded-full shadow-md transition duration-200'
      >
        <Edit size={16} />
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='p-4 border border-gray-200 rounded-lg shadow-inner mt-4 space-y-3 w-full max-w-sm mx-auto'
    >
      <h3 className='text-lg font-semibold text-gray-800 mb-4'>{title}</h3>

      {fields.map((field) => (
        <div key={field.name} className='flex flex-col space-y-1'>
          <label className='text-sm font-medium text-gray-700'>
            {field.label}:
          </label>
          <input
            type={field.type || 'text'}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(e, field.name)}
            className='w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      ))}

      <div className='flex gap-2 pt-2'>
        <button
          type='submit'
          className='flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200'
        >
          Enregistrer
        </button>
        <button
          type='button'
          onClick={() => {
            setIsFormVisible(false)
            if (onCancel) onCancel()
          }}
          className='flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition duration-200'
        >
          Annuler
        </button>
      </div>
    </form>
  )
}

export default EditForm
