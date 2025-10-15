import React from "react";

const EventItem = ({ event }) => (
  <div className="flex items-start py-4 border-b border-gray-200 last:border-b-0">
    <div
      className={`p-2 rounded-lg text-white font-bold text-xs ${event.color} mr-4`}
    >
      {event.category}
    </div>
    <div className="flex-grow">
      <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
      <p className="text-sm text-gray-500">{event.date}</p>
    </div>
  </div>
);

export default EventItem;
