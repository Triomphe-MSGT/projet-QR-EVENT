import React from "react";

const LocalisationCart = ({ location }) => {
	return (
		<div className='p-6 bg-white rounded-2xl shadow-lg border border-gray-200'>
			<h3 className='text-lg font-semibold text-gray-800 mb-4'>Localisation</h3>
			{location ? (
				<div className='space-y-2 text-gray-700'>
					<p>
						<strong>Adresse:</strong> {location.address}
					</p>
					<p>
						<strong>Ville:</strong> {location.city}
					</p>
					<p>
						<strong>Pays:</strong> {location.country}
					</p>
					{location.mapUrl && (
						<a
							href={location.mapUrl}
							target='_blank'
							rel='noopener noreferrer'
							className='inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200'
						>
							Voir sur la carte
						</a>
					)}
				</div>
			) : (
				<p className='text-gray-500'>Aucune localisation disponible.</p>
			)}
		</div>
	);
};

export default LocalisationCart;
