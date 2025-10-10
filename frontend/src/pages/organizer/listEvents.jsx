import { useNavigate } from "react-router-dom";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "../../hooks/useEvents";

const ItemList = () => {
  const navigate = useNavigate();
  const { data: items, isLoading, isError } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  console.log("✅ Événements récupérés :", items);
  if (isLoading) return <div>Chargement...</div>;
  if (isError) return <div>Erreur : impossible de récupérer les données</div>;

  const handleCreate = () => {
    createEvent.mutate(
      { content: "Nouvel événement", userId: 1 },
      {
        onSuccess: () => navigate("/my-events"),
      }
    );
  };

  return (
    <div>
      <button onClick={handleCreate}>Créer un événement</button>

      <ul>
        {items?.map((item) => (
          <li key={item.id}>
            {item.content}{" "}
            <button
              onClick={() =>
                updateEvent.mutate({ ...item, content: item.content + " ✔" })
              }
            >
              Modifier
            </button>
            <button onClick={() => deleteEvent.mutate(item.id)}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemList;
