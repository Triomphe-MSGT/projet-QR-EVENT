import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layouts/MainLayout";
import eventService from "../../services/eventService";
import EventListWithPagination from "../../components/events/EventList";
import SearchAndFilter from "../../components/events/SearchFilter";

const EventListPage = () => {
	const [events, setEvents] = useState([]);
	const [query, setQuery] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedCity, setSelectedCity] = useState("Toutes");

	useEffect(() => {
		eventService.getEvents().then((initiaEvent) => {
			console.log("Events chargés :", initiaEvent);
			setEvents(initiaEvent || []);
		});
	}, []);

	//  Filtrage
	const filteredEvents = (events || [])
		.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
		.filter((e) =>
			selectedCity === "Toutes" ? true : e.localisation === selectedCity
		);

	// Pagination
	const getEventsPerPage = (page) => (page === 1 ? 5 : 10);
	const eventsPerPage = getEventsPerPage(currentPage);

	const startIndex = currentPage === 1 ? 0 : 5 + (currentPage - 2) * 10;
	const endIndex = startIndex + eventsPerPage;

	const currentEvents = filteredEvents.slice(startIndex, endIndex);

	const totalPages = Math.ceil(
		filteredEvents.length > 5
			? 1 + (filteredEvents.length - 5) / 10
			: filteredEvents.length > 0
			? 1
			: 0
	);

	return (
		<MainLayout>
			<SearchAndFilter
				query={query}
				setQuery={setQuery}
				isFilterOpen={isFilterOpen}
				setIsFilterOpen={setIsFilterOpen}
				selectedCity={selectedCity}
				setSelectedCity={setSelectedCity}
				setCurrentPage={setCurrentPage}
			/>

			<div className='mt-6'>
				{/* Liste des événements avec pagination */}

				<EventListWithPagination
					currentEvents={currentEvents}
					currentPage={currentPage}
					totalPages={totalPages}
					setCurrentPage={setCurrentPage}
				/>
			</div>
		</MainLayout>
	);
};

export default EventListPage;
