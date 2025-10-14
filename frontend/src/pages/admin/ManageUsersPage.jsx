import { useAuth } from '../../hooks/useAuth'
import { PlusCircle, Loader2, Edit, Trash2, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCurrentUser } from '../../slices/authSlice'
import { deleteUser } from '../../services/authService'
import { useQueryClient } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'

const UserTabs = () => {
  const { data: users, isLoading } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  // Navigation vers la création
  const handleCreateClick = () => navigate()

  // Édition
  const handleEdit = (user) => {
    dispatch(setCurrentUser(user))
    navigate(`/edituser/${user.id}`)
  }

  // Suppression
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet événement ?'))
      return

    try {
      await deleteUser(id)
      queryClient.invalidateQueries(['users']) // Rafraîchir la liste
      toast.success('Événement supprimé avec succès !') // ✅ toast
    } catch (error) {
      console.error('Erreur suppression :', error)
      toast.error('Impossible de supprimer l’événement.')
    }
  }

  return (
    <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-8'>
      <Toaster position='top-right' />
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold text-gray-800'>
          Gestion des utilisateurs
        </h2>
        <button
          onClick={handleCreateClick}
          className='flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:bg-indigo-700 transition duration-150'
        >
          <PlusCircle size={18} />
          <span>Créer un utilisateur</span>
        </button>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center py-10 text-indigo-500'>
          <Loader2 size={24} className='animate-spin mr-2' />
          <span>Chargement des événements...</span>
        </div>
      ) : users && users.length > 0 ? (
        <div className='overflow-x-auto rounded-lg border border-gray-100 shadow-sm'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Nom
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Role
                </th>

                <th className='px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-100'>
              {users.map((user) => {
                return (
                  <tr
                    key={user.id}
                    className='hover:bg-indigo-50/50 transition duration-100'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {user.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {user.role}
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end'>
                      <button
                        onClick={() => handleEdit(user)}
                        title='Modifier'
                        className='text-gray-600 hover:text-indigo-600'
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)} // Correction ici
                        title='Supprimer'
                        className='text-red-600 hover:text-red-800'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='text-center text-gray-500 py-10'>
          Aucun événement disponible pour le moment.
        </div>
      )}
    </div>
  )
}

export default UserTabs
