// src/components/admin/UserManagement.jsx
import React, { useState } from "react";
import {
  useAllUsers,
  useDeleteUser,
  useCreateUser,
  useUpdateUser,
} from "../../hooks/useAdmin";
import Button from "../ui/Button";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import UserFormModal from "./UserFormModal";

const UserManagement = () => {
  const { data: users = [], isLoading, isError, error } = useAllUsers();
  const deleteUserMutation = useDeleteUser();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const handleDelete = (userId, userName) => {
    if (window.confirm(`Supprimer l'utilisateur "${userName}" ?`)) {
      deleteUserMutation.mutate(userId, {
        onError: (err) => alert(`Erreur: ${err.message}`),
      });
    }
  };

  const handleEdit = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };
  const handleCreate = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData) => {
    const mutation = userToEdit ? updateUserMutation : createUserMutation;
    const actionData = userToEdit
      ? { id: userToEdit.id, userData: formData }
      : formData;

    mutation.mutate(actionData, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
      onError: (err) =>
        alert(`Erreur: ${err.response?.data?.error || err.message}`),
    });
  };

  if (isLoading) {
    return (
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <Loader2 className="animate-spin inline-block mr-2 text-blue-500" />
        Chargement des utilisateurs...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/30 rounded-lg shadow text-red-600">
        Erreur lors du chargement des utilisateurs :{" "}
        {error?.message || "Erreur inconnue"}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Gestion des Utilisateurs ({users.length})
        </h2>
        <Button
          onClick={handleCreate}
          size="sm"
          variant="primary"
          className="w-full sm:w-auto"
        >
          <PlusCircle size={16} className="mr-2" /> Ajouter un Utilisateur
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
          {/* --- ✅ CORRECTION "WHITESPACE" --- */}
          {/* Mettre <thead> et <tr> sur la même ligne */}
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Profession
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sexe
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* --- ✅ CORRECTION "WHITESPACE" --- */}
          {/* Mettre <tbody> et le {map} sur la même ligne */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              // Mettre <tr> sur la même ligne que le début du map ou {
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.nom}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {user.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">
                  {user.role}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {user.profession || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {user.sexe || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="outline_icon"
                    size="xs"
                    onClick={() => handleEdit(user)}
                    title="Modifier"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="danger_icon"
                    size="xs"
                    onClick={() => handleDelete(user.id, user.nom)}
                    title="Supprimer"
                    disabled={
                      deleteUserMutation.isPending &&
                      deleteUserMutation.variables === user.id
                    }
                  >
                    {deleteUserMutation.isPending &&
                    deleteUserMutation.variables === user.id ? (
                      <Loader2 className="animate-spin w-3.5 h-3.5" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          {/* --- FIN DE LA CORRECTION --- */}
        </table>
      </div>

      {/* Affichage de la modale */}
      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={userToEdit}
          isSubmitting={
            createUserMutation.isPending || updateUserMutation.isPending
          }
        />
      )}
    </div>
  );
};

export default UserManagement;
