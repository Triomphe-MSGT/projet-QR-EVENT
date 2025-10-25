// src/components/admin/UserManagement.jsx
import React, { useState } from "react";
import { useAllUsers, useDeleteUser } from "../../hooks/useAdmin"; // Hooks pour les données et la suppression
import Button from "../ui/Button"; // ✅ Vérifiez le chemin
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import UserFormModal from "./UserFormModal";

/**
 * Composant pour afficher et gérer la liste des utilisateurs dans le dashboard admin.
 */
const UserManagement = () => {
  // 1. Récupère la liste des utilisateurs et les états associés
  const { data: users = [], isLoading, isError, error } = useAllUsers();
  // 2. Prépare la mutation pour la suppression
  const deleteUserMutation = useDeleteUser();

  // 3. États locaux pour gérer l'ouverture de la modale et l'utilisateur à modifier
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // 4. Fonction pour gérer la suppression d'un utilisateur
  const handleDelete = (userId, userName) => {
    if (
      window.confirm(
        `Supprimer l'utilisateur "${userName}" ? Attention, cette action est irréversible.`
      )
    ) {
      deleteUserMutation.mutate(userId, {
        onSuccess: () => console.log(`Utilisateur ${userId} supprimé.`),
        onError: (err) =>
          alert(`Erreur lors de la suppression: ${err.message}`),
      });
    }
  };

  // 5. Fonction pour ouvrir la modale en mode édition
  const handleEdit = (user) => {
    setUserToEdit(user); // Stocke l'utilisateur à modifier
    setIsModalOpen(true); // Ouvre la modale
  };

  // 6. Fonction pour ouvrir la modale en mode création
  const handleCreate = () => {
    setUserToEdit(null); // Pas d'utilisateur initial pour la création
    setIsModalOpen(true); // Ouvre la modale
  };

  // 7. Fonction appelée par la modale lors de la soumission du formulaire
  const handleFormSubmit = (formData) => {
    // ---- LOGIQUE À ACTIVER QUAND LA MODALE SERA PRÊTE ----
    // const mutation = userToEdit ? useUpdateUser() : useCreateUser();
    // const action = userToEdit ? { id: userToEdit.id, userData: formData } : formData;
    // mutation.mutate(action, {
    //   onSuccess: () => {
    //      console.log(userToEdit ? "Utilisateur mis à jour" : "Utilisateur créé");
    //      setIsModalOpen(false); // Ferme la modale en cas de succès
    //   },
    //   onError: (err) => alert(`Erreur: ${err.message}`),
    // });
    // ---- FIN LOGIQUE MODALE ----

    console.log("Données reçues pour soumission :", formData);
    setIsModalOpen(false); // Ferme la modale pour l'instant
  };

  // 8. Affichage pendant le chargement des données
  if (isLoading) {
    return (
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <Loader2 className="animate-spin inline-block mr-2 text-blue-500" />
        Chargement des utilisateurs...
      </div>
    );
  }

  // 9. Affichage en cas d'erreur de chargement
  if (isError) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/30 rounded-lg shadow text-red-600">
        Erreur lors du chargement des utilisateurs :{" "}
        {error?.message || "Erreur inconnue"}
      </div>
    );
  }

  // 10. Affichage principal du tableau
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* En-tête avec titre et bouton Ajouter */}
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

      {/* Tableau des utilisateurs */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
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
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Données de l'utilisateur */}
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.nom}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {user.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">
                  {user.role}
                </td>
                {/* Boutons d'action */}
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
                    // Désactive le bouton si cette suppression est en cours
                    disabled={
                      deleteUserMutation.isPending &&
                      deleteUserMutation.variables === user.id
                    }
                  >
                    {/* Affiche une icône de chargement pendant la suppression */}
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
        </table>
      </div>

      {/* --- Affichage de la modale (à décommenter) --- */}
      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={userToEdit}
          // Passez l'état de chargement des mutations ici
          // isSubmitting={createUserMutation.isPending || updateUserMutation.isPending}
        />
      )}
    </div>
  );
};

export default UserManagement;
