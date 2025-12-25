import React, { useState, useCallback, useRef } from "react";
import { searchUsers } from "../../../services/adminService";
import { X, Trash2, Loader2, UserX, Plus, Search } from "lucide-react";
import Button from "../../../components/ui/Button";
import { debounce } from "lodash";
import {
  useAddParticipant,
  useRemoveParticipant,
} from "../../../hooks/useEvents";

const ParticipantManagementModal = ({ event, onClose }) => {
  const removeMutation = useRemoveParticipant();
  const addMutation = useAddParticipant();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const participants = event.participants || [];
  const participantsListRef = useRef(null);

  /**
   * Handles the removal of a participant from the event.
   */
  const handleRemove = (participantId, participantName) => {
    if (window.confirm(`Retirer "${participantName}" de cet événement ?`)) {
      removeMutation.mutate(
        { eventId: event.id, participantId },
        {
          onError: (err) =>
            alert(`Erreur: ${err.response?.data?.error || err.message}`),
        }
      );
    }
  };

  /**
   * Handles the addition of a new participant to the event.
   */
  const handleAdd = (participant) => {
    if (
      participants.some(
        (p) => p._id === participant._id || p.id === participant.id
      )
    ) {
      alert(`${participant.nom} est déjà inscrit.`);
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    addMutation.mutate(
      { eventId: event.id, participantId: participant._id || participant.id },
      {
        onSuccess: () => {
          setSearchQuery("");
          setSearchResults([]);
          // Scroll to the participants list
          participantsListRef.current?.scrollIntoView({ behavior: "smooth" });
        },
        onError: (err) =>
          alert(`Erreur: ${err.response?.data?.error || err.message}`),
      }
    );
  };

  /**
   * Debounced search for users to add as participants.
   */
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      try {
        setIsSearching(true);
        const results = await searchUsers(query);
        setSearchResults(results);
      } catch (err) {
        console.error("Erreur recherche participants:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400),
    []
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-3xl relative animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">
          Gérer les Inscrits
        </h2>
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
          {event.name}
        </p>

        {/* Add Participant Section */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ajouter un Participant
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {isSearching ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Search size={18} />
              )}
            </span>
          </div>

          {/* Search Results */}
          {searchQuery.length > 1 && (
            <div className="mt-2 border dark:border-gray-600 rounded-md max-h-40 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((user) => {
                  const userId = user._id || user.id;
                  return (
                    <div
                      key={userId}
                      className="flex items-center justify-between p-3 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div>
                        <p className="text-sm font-medium dark:text-white">
                          {user.nom}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email} ({user.role})
                        </p>
                      </div>
                      <Button
                        variant="outline_icon"
                        size="xs"
                        aria-label={`Ajouter ${user.nom}`}
                        onClick={() => handleAdd(user)}
                        disabled={
                          addMutation.isPending &&
                          addMutation.variables?.participantId === userId
                        }
                      >
                        {addMutation.isPending &&
                        addMutation.variables?.participantId === userId ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <Plus size={16} />
                        )}
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  Aucun résultat trouvé.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Participants List */}
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-6 mb-2">
          Participants Inscrits ({participants.length})
        </h3>
        <div
          ref={participantsListRef}
          className="max-h-[40vh] overflow-y-auto pr-2 border-t pt-4 dark:border-gray-600"
        >
          {participants.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <UserX size={24} className="mx-auto mb-2" />
              Aucun participant inscrit pour le moment.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Participant
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Sexe
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Profession
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {participants.map((p) => {
                  const participantId = p._id || p.id;
                  return (
                    <tr key={participantId}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-100">
                          {p.nom}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {p.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {p.sexe || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {p.profession || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="danger_icon"
                          size="xs"
                          aria-label={`Retirer ${p.nom}`}
                          onClick={() => handleRemove(participantId, p.nom)}
                          disabled={
                            removeMutation.isPending &&
                            removeMutation.variables?.participantId ===
                              participantId
                          }
                        >
                          {removeMutation.isPending &&
                          removeMutation.variables?.participantId ===
                            participantId ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantManagementModal;
