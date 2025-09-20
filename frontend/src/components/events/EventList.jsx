import EventCard from "./EventCard";

const EventListWithPagination = ({
	currentEvents,
	currentPage,
	totalPages,
	setCurrentPage,
}) => {
	return (
		<div>
			{/* Liste des événements */}
			<h2 className='text-2xl font-bold text-gray-800 mb-4'>
				Liste des Événements
			</h2>
			<div className='space-y-4'>
				{console.log("DEBUG EVENTS =>", currentEvents)}
				{currentEvents.length > 0 ? (
					currentEvents.map((event) => (
						<EventCard key={event.id} event={event} />
					))
				) : (
					<p className='text-center text-gray-500'>Aucun événement trouvé.</p>
				)}
			</div>

			{/* Pagination */}
			<div className='flex justify-center items-center mt-6 space-x-2'>
				<button
					onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
					disabled={currentPage === 1}
					className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300'
				>
					Précédent
				</button>

				<span className='flex space-x-1'>
					{Array.from({ length: totalPages }, (_, i) => (
						<button
							key={i + 1}
							onClick={() => setCurrentPage(i + 1)}
							className={`px-4 py-2 rounded-lg ${
								currentPage === i + 1
									? "bg-blue-500 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							{i + 1}
						</button>
					))}
				</span>

				<button
					onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
					disabled={currentPage === totalPages}
					className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300'
				>
					Suivant
				</button>
			</div>
		</div>
	);
};

export default EventListWithPagination;
