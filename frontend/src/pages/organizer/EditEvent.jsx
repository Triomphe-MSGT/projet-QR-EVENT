import React from 'react'
import EditForm from '../../components/ui/editForm'

const EditEvent = ({ events, onUpdate }) => {
  const fields = [
    { name: 'name', label: 'Nom', type: 'text' },
    { name: 'debut', label: 'Debut', type: 'date' },
    { name: 'fin', label: 'Fin', type: 'date' },
    { name: 'lieu', label: 'Lieu', type: 'text' },
  ]

  return (
    <EditForm
      title='Modifier le profil'
      fields={fields}
      initialData={events}
      onSubmit={(data) => onUpdate(data)}
    />
  )
}

export default EditEvent
