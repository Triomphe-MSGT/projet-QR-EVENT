import { useState } from "react";
import { useCreateEvent } from "../../hooks/useEvents";
import MainLayout from "../../components/layouts/MainLayout";
import { useNavigate } from "react-router-dom";

const EventForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: "",
    time: "",
    location: "",
    description: "",
    price: "",
    qrReason: "",
    uniqueQr: false,
    image: null,
  });

  const createEventMutation = useCreateEvent();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.type || !formData.date) {
      alert("Veuillez remplir les champs obligatoires !");
      return;
    }

    const eventToSend = {
      ...formData,
      image: formData.image ? formData.image.name : null,
    };

    createEventMutation.mutate(eventToSend, {
      onSuccess: () => {
        alert("Événement créé avec succès !");
        setFormData({
          name: "",
          type: "",
          date: "",
          time: "",
          location: "",
          description: "",
          price: "",
          qrReason: "",
          uniqueQr: false,
          image: null,
        });
        navigate("/my-events");
      },
    });
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100 text-center">
          Créer un nouvel événement
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Nom de l'événement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Conférence sur l'IA"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                         focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Type d'événement <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                         focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">Sélectionner un type</option>
              <option value="conference">Conférence</option>
              <option value="atelier">Atelier</option>
              <option value="concert">Concert</option>
            </select>
          </div>

          {/* Date & Heure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                           focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Heure
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                           focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Lieu
            </label>
            <input
              type="text"
              name="location"
              placeholder="Centre de congrès XYZ"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                         focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Décrivez votre événement..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                         focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            />
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Prix du billet (en FCFA)
            </label>
            <input
              type="number"
              name="price"
              placeholder="Optionnel"
              value={formData.price}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                         focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* QR Code */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Raison du QR Code
            </label>
            <select
              name="qrReason"
              value={formData.qrReason}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                         focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">Sélectionner une raison</option>
              <option value="acces">Accès</option>
              <option value="billet">Billet</option>
            </select>
          </div>

          {/* Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="uniqueQr"
              checked={formData.uniqueQr}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Générer un QR code unique
            </label>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Image de l'événement
            </label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              className="w-full text-sm text-gray-700 dark:text-gray-300 
                         file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                         file:text-sm file:font-semibold 
                         file:bg-blue-50 dark:file:bg-gray-700 file:text-blue-600 dark:file:text-gray-200 
                         hover:file:bg-blue-100 dark:hover:file:bg-gray-600 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createEventMutation.isLoading}
            className="w-full py-2 rounded-lg font-medium 
                       bg-blue-600 hover:bg-blue-700 text-white
                       disabled:opacity-70 transition-all duration-200"
          >
            {createEventMutation.isLoading
              ? "Création en cours..."
              : "Créer l'événement"}
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default EventForm;
