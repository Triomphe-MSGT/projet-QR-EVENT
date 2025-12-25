import { useState, useEffect } from "react";

const Togglable = (props) => {
  const { activeTab, setActiveTab, firstTabLabel, secondTabLabel, firstTabContent, secondTabContent } = props;
  
  const isFirstTab = activeTab === firstTabLabel;

  return (
    <div className="w-full max-w-lg">
      {/* Tab Switcher */}
      <div className="flex p-1.5 bg-gray-200/50 dark:bg-[#3A3B3C] rounded-2xl mb-6 relative overflow-hidden border border-gray-200 dark:border-[#3E4042]">
        {/* Animated Slider */}
        <div 
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-[#242526] rounded-xl transition-all duration-500 ease-out shadow-sm ${
            isFirstTab ? 'left-1.5' : 'left-[calc(50%+3px)]'
          }`}
        ></div>
        
        <button
          onClick={() => setActiveTab(firstTabLabel)}
          className={`relative z-10 flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
            isFirstTab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {firstTabLabel}
        </button>
        <button
          onClick={() => setActiveTab(secondTabLabel)}
          className={`relative z-10 flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
            !isFirstTab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {secondTabLabel}
        </button>
      </div>

      {/* Content Container */}
      <div className="relative min-h-[500px]">
        <div
          className={`transition-all duration-500 ease-in-out ${
            isFirstTab
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-8 pointer-events-none absolute inset-0"
          }`}
        >
          {firstTabContent}
        </div>

        <div
          className={`transition-all duration-500 ease-in-out ${
            !isFirstTab
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-8 pointer-events-none absolute inset-0"
          }`}
        >
          {secondTabContent}
        </div>
      </div>
    </div>
  );
};

export default Togglable;
