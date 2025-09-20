import React from "react";
import Button from "../ui/Button";

const EventCard = ({ event, handleSelect }) => {
	return (
		<div className='event-card bg-white p-4 rounded-xl shadow-md cursor-pointer'>
			<div className='flex items-center gap-4'>
				<div className='flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold text-lg'>
					{/* Première lettre du nom de l'événement */}

					{!event.url && event.name.charAt(0).toUpperCase()}
					{event.url && (
						<img
							src={event.url}
							alt={event.name}
							className='w-20 h-20 rounded-xl object-cover'
						/>
					)}
				</div>
				<div className='flex-grow'>
					<h3 className='text-lg font-semibold text-gray-800'>{event.name}</h3>
					<p className='text-sm text-gray-500 mt-1'>{event.description}</p>
					<p>{event.date}</p>
					<p>{event.localisation}</p>
				</div>
			</div>
			<div className='flex items-center justify-end gap-2 mt-4'>
				<button className='px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200'>
					Détails
				</button>
				{/* <button className='px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200'>
					Participer
				</button> */}
				<Button variant='primary' size='sm' onClick={handleSelect}>
					Sélectionner
				</Button>
			</div>
		</div>
	);
};

export default EventCard;
