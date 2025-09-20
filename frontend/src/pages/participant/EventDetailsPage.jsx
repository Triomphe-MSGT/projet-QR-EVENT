import EventDetails from "../../components/events/EventDetails";
import MainLayout from "../../components/layouts/MainLayout";
import { useState, useEffect } from "react";

const EventDetailsPage = () => {
	const [event, setEvent] = useState({
		id: 2,
		name: "Atelier Blockchain",
		url: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
		description:
			"Découvrez les opportunités offertes par la technologie blockchain pour l’Afrique.",
		date: "15/10/2025",
		localisation: "Yaoundé",
	});
	// Récupérer lelement selectionne.
	// const [selectedEventId, setSelectedEventId] = useState(null);

	// const handleSelect = (id) => {
	//     setSelectedEventId(id); // on met à jour l'état avec l'id sélectionné
	//     console.log("Événement sélectionné :", id);
	//   };

	return (
		<MainLayout>
			<EventDetails
				imageUrl={event.url}
				name={event.name}
				description={event.description}
				date={event.date}
				localisation={event.localisation}
			/>
		</MainLayout>
	);
};

export default EventDetailsPage;
