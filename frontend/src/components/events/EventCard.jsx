import React from "react";
import Button from "../ui/Button";

const EventCard = ({ event, handleDetails }) => {
  return (
    <div
      className="
        event-card 
        bg-white dark:bg-[#242526] 
        text-[#050505] dark:text-[#E4E6EB]
        p-4 rounded-xl shadow-md cursor-pointer 
        transition-all duration-300 hover:shadow-lg
      "
    >
      <div className="flex items-center gap-4">
        {/* Image ou initiale */}
        <div
          className="
            flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden 
            bg-[#0866FF] flex items-center justify-center 
            text-white font-bold text-lg
          "
        >
          {!event.url && event.name.charAt(0).toUpperCase()}
          {event.url && (
            <img
              src={event.url}
              alt={event.name}
              className="w-16 h-16 object-cover"
            />
          )}
        </div>

        {/* Détails texte */}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-[#050505] dark:text-[#E4E6EB]">
            {event.name}
          </h3>
          <p className="text-sm text-[#65676B] dark:text-[#B0B3B8] mt-1">
            {event.description}
          </p>
          <p className="text-sm text-[#65676B] dark:text-[#B0B3B8] mt-1">
            📅 {event.date}
          </p>
          <p className="text-sm text-[#65676B] dark:text-[#B0B3B8]">
            📍 {event.localisation}
          </p>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="border-[#0866FF] text-[#0866FF] hover:bg-[#0866FF] hover:text-white dark:border-[#E4E6EB] dark:text-[#E4E6EB] dark:hover:bg-[#3A3B3C]"
          onClick={handleDetails}
        >
          Détails
        </Button>

        <Button
          variant="primary"
          size="sm"
          className="bg-[#0866FF] hover:bg-[#0556D0] text-white"
          onClick={handleDetails}
        >
          Participer
        </Button>
      </div>
    </div>
  );
};

export default EventCard;
