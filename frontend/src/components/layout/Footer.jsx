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

      {/* Mobile Navigation Bar - YouTube Style */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <nav className="bg-white flex justify-around items-center h-14 px-1">
          {navItems.map((item, index) => {
            const active = isActive(item.path);
            
            // On insère le bouton "Plus" au milieu pour les créateurs
            const showPlus = index === 2 && isCreator;
            
            return (
              <React.Fragment key={item.label}>
                {showPlus && (
                  <Link
                    to="/createevent"
                    className="flex flex-col items-center justify-center p-1 -mt-6"
                  >
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-900/40 border-4 border-white active:scale-95 transition-transform">
                      <Plus size={24} strokeWidth={3} />
                    </div>
                    <span className="text-[7px] font-bold uppercase tracking-tighter mt-1 text-slate-400">Créer</span>
                  </Link>
                )}
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${active ? "text-orange-500" : "text-slate-400"}`}
                >
                  <item.icon className={`w-5 h-5 ${active ? "fill-orange-50" : ""}`} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[8px] font-black uppercase tracking-tighter mt-1">{item.label}</span>
                </Link>
              </React.Fragment>
            );
          })}
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
