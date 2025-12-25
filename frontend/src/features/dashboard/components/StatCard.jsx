import React from "react";

export const StatCard = ({
  title,
  value = 0,
  icon: Icon,
  color = "bg-gray-600",
}) => {
  return (
    <div className={`p-5 rounded-xl shadow-lg text-white ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {Icon && (
          <div className="bg-white/20 p-3 rounded-full">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
