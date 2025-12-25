import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import {
  Search,
  LogIn,
  QrCode,
  Edit,
  BarChart3,
  ScanLine,
  Users,
  User,
  HelpCircle,
  Download,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone
} from "lucide-react";

const HelpSection = ({ title, icon: Icon, children, id }) => (
  <section id={id} className="scroll-mt-24 space-y-8">
    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
        {title}
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </section>
);

const HelpCard = ({ icon: Icon, title, description, steps }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-all duration-500">
          <Icon className="w-7 h-7" />
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-400 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-6">
        {description}
      </p>

      {isOpen && (
        <div className="space-y-4 animate-fade-in-down">
          <div className="h-px bg-gray-50 dark:bg-gray-700 mb-6" />
          <ul className="space-y-4">
            {steps.map((step, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                  {step}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const quickLinks = [
    { label: "Tickets", icon: QrCode, color: "text-blue-600", bg: "bg-blue-50", id: "participants" },
    { label: "Organiser", icon: Edit, color: "text-purple-600", bg: "bg-purple-50", id: "organizers" },
    { label: "Scanner", icon: ScanLine, color: "text-amber-600", bg: "bg-amber-50", id: "organizers" },
    { label: "Support", icon: MessageCircle, color: "text-green-600", bg: "bg-green-50", id: "contact" },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
        {/* Hero Header */}
        <div className="relative bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-widest uppercase mb-8 border border-blue-100 dark:border-blue-800/50">
              <HelpCircle className="w-4 h-4" /> Centre d'aide
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9] mb-8">
              Comment pouvons-nous <br /> <span className="text-blue-600">vous aider ?</span>
            </h1>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une réponse (ex: QR code, scanner, profil...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-[2.5rem] shadow-2xl shadow-blue-600/5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-lg font-medium"
              />
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              {quickLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={`#${link.id}`}
                  className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg ${link.bg} flex items-center justify-center ${link.color}`}>
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-7xl mx-auto px-4 py-24 space-y-32">
          
          {/* Participant Section */}
          <HelpSection id="participants" title="Pour les Participants" icon={User}>
            <HelpCard 
              icon={Search}
              title="Explorer & Découvrir"
              description="Trouvez les meilleurs événements au Cameroun sans même avoir besoin de compte."
              steps={[
                "Parcourez la page d'accueil pour voir les tendances.",
                "Utilisez les filtres par catégorie ou par ville.",
                "Consultez les détails complets (date, lieu, prix) en un clic."
              ]}
            />
            <HelpCard 
              icon={QrCode}
              title="Obtenir mon Ticket QR"
              description="Votre ticket d'entrée est généré instantanément et stocké en toute sécurité."
              steps={[
                "Connectez-vous à votre compte participant.",
                "Cliquez sur 'Réserver ma place' sur l'événement de votre choix.",
                "Retrouvez votre QR code unique dans 'Mes QR Codes'."
              ]}
            />
            <HelpCard 
              icon={ScanLine}
              title="Accéder à l'événement"
              description="Une entrée fluide et sans papier le jour de l'événement."
              steps={[
                "Ouvrez 'Mes QR Codes' sur votre téléphone à l'entrée.",
                "Présentez votre QR code à l'organisateur.",
                "Une fois scanné, votre accès est validé instantanément."
              ]}
            />
            <HelpCard 
              icon={ShieldCheck}
              title="Sécurité & Confidentialité"
              description="Vos données et vos billets sont protégés par notre technologie."
              steps={[
                "Chaque QR code est unique et infalsifiable.",
                "Vos informations personnelles ne sont jamais partagées sans votre accord.",
                "Réinitialisez votre mot de passe à tout moment via les paramètres."
              ]}
            />
          </HelpSection>

          {/* Organizer Section */}
          <HelpSection id="organizers" title="Pour les Organisateurs" icon={Zap}>
            <HelpCard 
              icon={Edit}
              title="Créer un Événement"
              description="Publiez votre événement en quelques minutes et commencez à recevoir des inscrits."
              steps={[
                "Accédez à votre Dashboard Organisateur.",
                "Remplissez le formulaire de création (nom, lieu, description).",
                "Activez l'option QR Code pour sécuriser les entrées."
              ]}
            />
            <HelpCard 
              icon={ScanLine}
              title="Scanner les Entrées"
              description="Transformez votre smartphone en scanner professionnel."
              steps={[
                "Ouvrez l'outil de scan depuis votre Dashboard.",
                "Visez le QR code du participant avec votre caméra.",
                "Le système valide l'entrée en temps réel (Vert = OK, Rouge = Erreur)."
              ]}
            />
            <HelpCard 
              icon={Users}
              title="Gérer les Participants"
              description="Suivez qui est inscrit et qui est réellement présent."
              steps={[
                "Consultez la liste des inscrits en temps réel.",
                "Voyez l'heure exacte de validation pour chaque participant.",
                "Exportez la liste des présences pour vos rapports."
              ]}
            />
            <HelpCard 
              icon={BarChart3}
              title="Analyses & Rapports"
              description="Mesurez le succès de votre événement avec des données précises."
              steps={[
                "Visualisez le taux de remplissage sur votre dashboard.",
                "Téléchargez des rapports PDF détaillés par événement.",
                "Analysez les tendances pour vos futurs événements."
              ]}
            />
          </HelpSection>

          {/* FAQ Section */}
          <section className="bg-white dark:bg-gray-900 rounded-[3.5rem] p-8 md:p-20 border border-gray-100 dark:border-gray-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Questions Fréquentes</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Tout ce que vous devez savoir pour une expérience parfaite.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <h4 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600" /> Mot de passe oublié ?
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Cliquez sur "Mot de passe oublié" sur la page de connexion. Un lien de réinitialisation vous sera envoyé par e-mail instantanément.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600" /> Rôles multiples ?
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Un compte Organisateur peut participer à d'autres événements, mais un compte Participant doit demander un surclassement pour créer des événements.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600" /> Problème de caméra ?
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Assurez-vous d'utiliser une connexion HTTPS et d'avoir autorisé l'accès à la caméra dans les paramètres de votre navigateur.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600" /> Validité des tickets ?
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Chaque ticket est à usage unique. Une fois scanné, il ne peut plus être utilisé pour entrer, garantissant une sécurité maximale.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="text-center space-y-12 pb-20">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                Encore des <span className="text-blue-600">questions ?</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Notre équipe est là pour vous accompagner 7j/7.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href="mailto:support@qrevent.cm"
                className="flex items-center gap-4 px-8 py-6 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl hover:-translate-y-2 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">support@qrevent.cm</p>
                </div>
              </a>
              <a 
                href="tel:+237600000000"
                className="flex items-center gap-4 px-8 py-6 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl hover:-translate-y-2 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Téléphone</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">+237 6XX XX XX XX</p>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        html { scroll-behavior: smooth; }
      `}</style>
    </MainLayout>
  );
};

export default HelpPage;
