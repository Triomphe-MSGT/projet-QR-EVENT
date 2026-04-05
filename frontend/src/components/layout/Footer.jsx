import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, Search, QrCode, User, Plus, Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, Phone, ArrowRight } from "lucide-react";

const Footer = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const isActive = (path) => location.pathname === path;

  // Assuming roles logic. You may refine this to match your exact backend role strings.
  const isCreator = user?.role === "Organisateur" || user?.role === "Administrateur" || user?.role === "organisateur";

  const navItems = [
    { label: "Accueil", path: "/home", icon: Home },
    { label: "Explorer", path: "/events", icon: Search },
    { label: "Tickets", path: "/my-qrcodes", icon: QrCode },
    { label: "Profil", path: "/user-profile", icon: User },
  ];

  return (
    <>

      {/* Mobile Navigation Bar - Pro Floating Design */}
      <div className="fixed bottom-6 left-5 right-5 z-[100] lg:hidden">
        <nav className="bg-white/90 backdrop-blur-2xl border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex justify-between items-center h-20 px-2 relative">
          
          {/* Main Links (Left Side) */}
          <div className="flex flex-1 justify-around items-center">
            {navItems.slice(0, 2).map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${active ? "text-orange-500" : "text-slate-400 group"}`}
                >
                  <item.icon className={`w-6 h-6 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-[8.5px] font-bold uppercase tracking-widest mt-1 transition-opacity ${active ? "opacity-100" : "opacity-0"}`}>{item.label}</span>
                  {active && <div className="absolute -bottom-1 w-1 h-1 bg-orange-500 rounded-full" />}
                </Link>
              );
            })}
          </div>

          {/* Central Pro Action (Creators) or Aesthetic Divider */}
          {isCreator ? (
            <div className="relative -top-6">
              <Link
                to="/createevent"
                className="w-16 h-16 bg-orange-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-orange-500/40 hover:bg-orange-600 transition-all border-[6px] border-slate-50/50 active:scale-95"
              >
                <Plus size={32} strokeWidth={3} />
              </Link>
            </div>
          ) : (
            <div className="w-12" aria-hidden="true"></div>
          )}

          {/* Main Links (Right Side) */}
          <div className="flex flex-1 justify-around items-center">
            {navItems.slice(2).map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${active ? "text-orange-500" : "text-slate-400 group"}`}
                >
                  <item.icon className={`w-6 h-6 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-[8.5px] font-bold uppercase tracking-widest mt-1 transition-opacity ${active ? "opacity-100" : "opacity-0"}`}>{item.label}</span>
                  {active && <div className="absolute -bottom-1 w-1 h-1 bg-orange-500 rounded-full" />}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Desktop Footer (Web Version) */}
      <footer className="hidden lg:block bg-[#020617] text-slate-300 pt-20 pb-10 border-t border-slate-800/50">
        <div className="max-w-[1800px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="space-y-6 pr-8">
              <Link to="/home" className="flex items-center gap-3 group inline-block">
                <img src="/logo.png" alt="QR Event Logo" className="w-23 h-20 object-contain transition-transform group-hover:rotate-6" />
                <span className="text-2xl font-black text-white tracking-tight">QR EVENT</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed">
                L'innovation au service de l'événementiel. Gérez vos entrées, augmentez vos ventes et offrez une expérience inoubliable avec notre technologie QR avancée.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors duration-300"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors duration-300"><Twitter size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors duration-300"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors duration-300"><Linkedin size={18} /></a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Liens Rapides</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/home" className="text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Accueil</Link></li>
                <li><Link to="/events" className="text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Tous les événements</Link></li>
                <li><Link to="/my-qrcodes" className="text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Mes Billets Web</Link></li>
                <li><Link to="/user-profile" className="text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Espace Profil</Link></li>
              </ul>
            </div>

            {/* Organizers */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Pour les Organisateurs</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/createevent" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Créer un événement</Link></li>
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Simulateur de Tarifs</Link></li>
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Dashboard Pro</Link></li>
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Centre d'aide B2B</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Contactez-nous</h4>
              <ul className="space-y-5 text-sm">
                <li className="flex items-start gap-4">
                  <div className="p-2 bg-slate-800/50 rounded-lg text-orange-500"><MapPin size={18} /></div>
                  <span className="text-slate-400">Cocody Riviera, <br/>Abidjan, Côte d'Ivoire</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="p-2 bg-slate-800/50 rounded-lg text-orange-500"><Mail size={18} /></div>
                  <span className="text-slate-400">support@qr-event.com</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="p-2 bg-slate-800/50 rounded-lg text-orange-500"><Phone size={18} /></div>
                  <span className="text-slate-400">+225 00 00 00 00 00</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium text-slate-500">
            <p>© {new Date().getFullYear()} QR Event Plateforme. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-slate-300 transition-colors">Politique de confidentialité</Link>
              <Link to="#" className="hover:text-slate-300 transition-colors">Conditions générales d'utilisation</Link>
              <Link to="#" className="hover:text-slate-300 transition-colors">Mentions Légales</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
