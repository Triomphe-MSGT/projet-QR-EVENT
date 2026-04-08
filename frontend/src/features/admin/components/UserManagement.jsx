import React, { useState } from "react";
import {
  useAllUsers,
  useDeleteUser,
  useCreateUser,
  useUpdateUser,
} from "../../../hooks/useAdmin";
import Button from "../../../components/ui/Button";
import { PlusCircle, Edit, Trash2, Loader2, User, Mail, Shield, Briefcase } from "lucide-react";
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
      deleteUserMutation.mutate(userId);
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
      ? { id: userToEdit._id || userToEdit.id, userData: formData }
      : formData;

    mutation.mutate(actionData, {
      onSuccess: () => setIsModalOpen(false),
      onError: (err) => alert(`Erreur: ${err.response?.data?.error || err.message}`),
    });
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-orange-500" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronisation des membres...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">Répertoire Global</h2>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mt-1">
              {users.length} Comptes enregistrés
           </p>
        </div>
        <button
          onClick={handleCreate}
          className="w-full md:w-auto px-6 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2"
        >
          <PlusCircle size={16} /> Nouveau Profil
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              <th className="px-6 py-4 text-left font-black">Identité</th>
              <th className="px-6 py-4 text-left font-black">Rôle / Job</th>
              <th className="px-6 py-4 text-left font-black">Contact</th>
              <th className="px-6 py-4 text-right font-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id || user.id} className="group bg-white hover:bg-slate-50 transition-all rounded-3xl shadow-sm border border-slate-100">
                <td className="px-6 py-5 rounded-l-[1.5rem]">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black group-hover:bg-orange-600 group-hover:text-white transition-all">
                         {user.nom?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-500 uppercase tracking-tight">{user.nom}</p>
                         <p className="text-[9px] font-bold text-slate-300 uppercase">{user.sexe || "Non défini"}</p>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-5">
                   <div className="space-y-1">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        user.role === 'Administrateur' ? 'bg-red-50 text-red-600' : 
                        user.role === 'Organisateur' ? 'bg-purple-50 text-purple-600' : 
                        'bg-blue-50 text-blue-600'
                      }`}>
                         {user.role}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400 block truncate max-w-[120px]">{user.profession || "-"}</p>
                   </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2 text-slate-400">
                      <Mail size={12} className="text-slate-200" />
                      <span className="text-xs font-bold truncate max-w-[150px]">{user.email}</span>
                   </div>
                </td>
                <td className="px-6 py-5 text-right rounded-r-[1.5rem]">
                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-orange-600 hover:border-orange-100 rounded-xl transition-all shadow-sm"
                      >
                         <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id || user.id, user.nom)}
                        className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all shadow-sm"
                        disabled={deleteUserMutation.isPending}
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={userToEdit}
          isSubmitting={createUserMutation.isPending || updateUserMutation.isPending}
        />
      )}
    </div>
  );
};

export default UserManagement;
