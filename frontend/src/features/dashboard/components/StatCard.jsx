import React from "react";

const themeMap = {
  blue: "from-blue-600 to-blue-700 shadow-blue-500/20",
  purple: "from-purple-600 to-purple-700 shadow-purple-500/20",
  emerald: "from-emerald-600 to-emerald-700 shadow-emerald-500/20",
  orange: "from-orange-500 to-orange-600 shadow-orange-500/20",
  rose: "from-rose-500 to-rose-600 shadow-rose-500/20",
  slate: "from-slate-800 to-slate-900 shadow-slate-900/20",
};

export const StatCard = ({
  title,
  value = 0,
  icon: Icon,
  theme = "blue",
  description = "",
}) => {
  const themeClasses = themeMap[theme] || themeMap.blue;

  return (
    <div className={`p-6 md:p-8 rounded-[2rem] bg-gradient-to-br ${themeClasses} text-white shadow-2xl relative overflow-hidden group`}>
      {/* Texture Overlay */}
      <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center justify-between">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{title}</p>
           {Icon && (
             <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Icon size={20} />
             </div>
           )}
        </div>
        
        <div>
           <div className="text-3xl md:text-4xl font-black tracking-tighter mb-1">{value}</div>
           {description && <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{description}</p>}
        </div>
      </div>
    </div>
  );
};
