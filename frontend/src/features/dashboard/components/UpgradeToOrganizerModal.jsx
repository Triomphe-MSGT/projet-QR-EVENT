import React, { useState } from "react";
import { useUpgradeToOrganizer } from "../../../hooks/useUserProfile";
import { Loader2, CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";

const UpgradeToOrganizerModal = ({ onClose }) => {
  const [sexe, setSexe] = useState("");
  const [profession, setProfession] = useState("");
  const [phone, setPhone] = useState("");

  const upgradeMutation = useUpgradeToOrganizer();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!sexe || !profession || !phone) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    upgradeMutation.mutate(
      { sexe, profession, phone },
      {
        onSuccess: () => {
          setTimeout(() => onClose(), 2000);
        },
        onError: (error) => {
          console.error("Erreur de mise à niveau:", error);
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md mx-auto animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Devenir Organisateur
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Pour créer vos propres événements, veuillez compléter votre profil. Ces
          informations nous aident à mieux vous connaître.
        </p>

        {upgradeMutation.isSuccess ? (
          <div className="text-center p-6 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">
              Félicitations !
            </h3>
            <p className="text-green-600 dark:text-green-400 mt-2">
              Votre compte a été mis à niveau. Vous pouvez maintenant créer des
              événements.
            </p>
          </div>
        ) : (
          /* Upgrade Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="profession"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Profession ou Domaine d'activité
              </label>
              <input
                id="profession"
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Ex: Étudiant, Développeur, Marketeur"
                required
                className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Numéro de téléphone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 699XXXXXX"
                required
                className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="sexe"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Sexe
              </label>
              <select
                id="sexe"
                value={sexe}
                onChange={(e) => setSexe(e.target.value)}
                required
                className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="" disabled>
                  -- Sélectionner --
                </option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Error Message */}
            {upgradeMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                Erreur:{" "}
                {upgradeMutation.error.response?.data?.error ||
                  upgradeMutation.error.message}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={upgradeMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={upgradeMutation.isPending}
              >
                {upgradeMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Mise à niveau...
                  </>
                ) : (
                  "Confirmer et Mettre à niveau"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpgradeToOrganizerModal;
