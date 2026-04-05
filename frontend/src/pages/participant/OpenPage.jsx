import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomePage from "./HomePage";

const LoadingScreen = () => {
 return (
 <div className="fixed inset-0 flex flex-col justify-center items-center z-[9999]">
 <div className="relative flex flex-col items-center gap-8 ">
 <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center p-4">
 <img src="/logo.png" alt="Loading" className="w-full h-full object-contain " />
 </div>
 <div className="flex flex-col items-center gap-2">
 <h1 className="text-3xl font-black tracking-tighter ">
 QR Event
 </h1>
 <div className="flex gap-1.5 pt-2">
 {[0, 1, 2].map((i) => (
 <div key={i} className="w-1.5 h-1.5 rounded-full " style={{ animationDelay: `${i * 0.15}s` }}
 ></div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
};

const OpenPage = () => {
 const [loading, setLoading] = useState(true);
 const navigate = useNavigate();

 useEffect(() => {
 const timer = setTimeout(() => setLoading(false), 2000);
 return () => clearTimeout(timer);
 }, []);

 if (loading) return <LoadingScreen />;

 return <HomePage />;
};

export default OpenPage;
