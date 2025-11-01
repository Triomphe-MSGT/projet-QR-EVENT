import React from "react";
import MainLayout from "../components/layouts/MainLayout";
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
} from "lucide-react";

/**
 * Un composant réutilisable pour structurer chaque point d'aide.
 * Il crée une "carte" visuelle pour chaque explication.
 */
const HelpCard = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col sm:flex-row">
    <div className="flex-shrink-0 w-full sm:w-20 h-20 sm:h-auto flex items-center justify-center bg-blue-50 dark:bg-gray-700">
      {React.cloneElement(icon, {
        className: "w-10 h-10 text-blue-500 dark:text-blue-400",
      })}
    </div>
    <div className="p-5">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <div className="text-gray-700 dark:text-gray-300 space-y-2">
        {children}
      </div>
    </div>
  </div>
);

const HelpPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Guide d'utilisation Qr-Event
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
          Bienvenue ! Voici comment tirer le meilleur parti de notre plateforme,
          que vous soyez un simple visiteur, un participant ou un organisateur.
        </p>

        {/* ================================================================== */}
        {/* Section Visiteur */}
        {/* ================================================================== */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b pb-2">
            🧭 Pour les Visiteurs
          </h2>
          <div className="space-y-6">
            <HelpCard icon={<Search />} title="1. Explorer les Événements">
              <p>
                En tant que visiteur, vous avez un accès public pour découvrir
                tous les événements. Vous n'avez pas besoin de compte pour :
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  Parcourir la page d'accueil et voir les événements à la une.
                </li>
                <li>
                  Filtrer les événements par catégories (Conférences, Concerts,
                  etc.).
                </li>
                <li>
                  Consulter les détails : voir la date, le lieu, la description
                  et le prix.
                </li>
              </ul>
            </HelpCard>

            <HelpCard
              icon={<LogIn />}
              title="2. S'inscrire (Devenir Participant)"
            >
              <p>
                Pour interagir avec un événement (comme vous y inscrire), vous
                devez avoir un compte.
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  Cliquez sur <strong>"Participer"</strong> sur la page d'un
                  événement.
                </li>
                <li>
                  Le système vous invitera à vous <strong>connecter</strong> ou
                  à <strong>créer un compte</strong> (Participant ou
                  Organisateur).
                </li>
                <li>Une fois connecté, vous devenez un "Participant".</li>
              </ul>
            </HelpCard>
          </div>
        </section>

        {/* ================================================================== */}
        {/* Section Participant */}
        {/* ================================================================== */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b pb-2">
            🎟️ Pour les Participants
          </h2>
          <div className="space-y-6">
            <HelpCard
              icon={<QrCode />}
              title="1. Obtenir votre Ticket (QR Code)"
            >
              <p>
                Une fois connecté en tant que Participant, cliquez sur{" "}
                <strong>"Participer & Obtenir le QR Code"</strong> sur la page
                d'un événement.
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  Le système génère instantanément un{" "}
                  <strong>QR code unique</strong>.
                </li>
                <li>
                  Ce QR code est votre <strong>ticket d'entrée officiel</strong>
                  . Il est sauvegardé automatiquement dans votre profil.
                </li>
              </ul>
            </HelpCard>

            <HelpCard icon={<User />} title="2. Retrouver vos Tickets">
              <p>
                Vous n'avez pas besoin de chercher dans vos e-mails. Tous vos
                tickets sont centralisés :
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Cliquez sur votre icône de profil (en haut à droite).</li>
                <li>
                  Allez dans le menu <strong>"Mes QR Codes"</strong>.
                </li>
                <li>
                  Vous y trouverez la liste de tous vos tickets pour tous vos
                  événements.
                </li>
              </ul>
            </HelpCard>

            <HelpCard icon={<ScanLine />} title="3. Entrer à l'Événement">
              <p>Le jour J, l'entrée est simple et rapide :</p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  Rendez-vous sur <strong>"Mes QR Codes"</strong> depuis votre
                  téléphone.
                </li>
                <li>
                  Cliquez sur <strong>"Afficher pour Scan"</strong> pour
                  l'événement concerné.
                </li>
                <li>
                  Le QR code s'affiche en grand. Présentez-le à l'organisateur.
                </li>
                <li>L'organisateur le scanne, et vous êtes validé !</li>
              </ul>
            </HelpCard>
          </div>
        </section>

        {/* ================================================================== */}
        {/* Section Organisateur */}
        {/* ================================================================== */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b pb-2">
            🚀 Pour les Organisateurs
          </h2>
          <div className="space-y-6">
            <HelpCard icon={<Edit />} title="1. Créer et Gérer vos Événements">
              <p>
                En vous inscrivant en tant qu'<strong>Organisateur</strong>,
                vous accédez au <strong>Tableau de Bord</strong>.
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  Cliquez sur <strong>"Créer un Nouvel Événement"</strong>.
                </li>
                <li>
                  Remplissez tous les détails : nom, lieu (ville, quartier),
                  dates, catégorie, etc.
                </li>
                <li>
                  N'oubliez pas d'activer l'option{" "}
                  <strong>"Activer les QR codes"</strong> pour sécuriser vos
                  entrées.
                </li>
              </ul>
            </HelpCard>

            <HelpCard
              icon={<ScanLine />}
              title="2. Scanner les Tickets à l'Entrée"
            >
              <p>
                Plus besoin de listes papier. Votre téléphone est votre scanner.
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  Sur votre Tableau de Bord, trouvez votre événement (dans "À
                  venir").
                </li>
                <li>
                  Cliquez sur l'icône <strong>Scanner</strong> (
                  <QrCode size={16} className="inline-block" />
                  ).
                </li>
                <li>La caméra s'active. Visez le QR code du participant.</li>
                <li>
                  Le système vous dit instantanément si le ticket est{" "}
                  <strong>Valide (Vert)</strong> ou{" "}
                  <strong>Invalide (Rouge)</strong> (ex: déjà scanné, mauvais
                  événement).
                </li>
                <li>
                  Cliquez sur <strong>"Scanner le ticket suivant"</strong> pour
                  valider la personne suivante.
                </li>
              </ul>
            </HelpCard>

            <HelpCard icon={<Users />} title="3. Voir qui est Vraiment Venu">
              <p>Suivez en temps réel qui a été validé.</p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  Sur votre Tableau de Bord, cliquez sur l'icône{" "}
                  <strong>Gérer</strong> (
                  <Users size={16} className="inline-block" />) sur la carte de
                  votre événement.
                </li>
                <li>
                  Vous verrez la **liste complète** (nom, email, profession,
                  sexe) de{" "}
                  <strong>
                    toutes les personnes dont le ticket a été scanné
                  </strong>
                  .
                </li>
              </ul>
            </HelpCard>

            <HelpCard icon={<BarChart3 />} title="4. Analyser vos Données">
              <p>
                Votre Tableau de Bord affiche vos statistiques clés (Total
                Inscrits, Total Validés). Pour aller plus loin :
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  Cliquez sur l'icône <strong>Rapport</strong> (
                  <Download size={16} className="inline-block" />) sur une carte
                  d'événement pour un <strong>rapport PDF</strong> détaillé.
                </li>
                <li>
                  (Pour les Admins) Cliquez sur{" "}
                  <strong>"Télécharger le Rapport (.csv)"</strong> en haut du
                  dashboard pour un export de toutes les statistiques.
                </li>
              </ul>
            </HelpCard>
          </div>
        </section>

        {/* ================================================================== */}
        {/* Section FAQ */}
        {/* ================================================================== */}
        <section>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b pb-2">
            Foire Aux Questions (FAQ)
          </h2>
          <div className="space-y-6">
            <HelpCard
              icon={<HelpCircle />}
              title="Que faire si j'ai perdu mon mot de passe ?"
            >
              <p>
                Sur la page de connexion (`/login`), cliquez sur le lien "Mot de
                passe oublié" et suivez les instructions pour le réinitialiser
                par e-mail.
              </p>
            </HelpCard>
            <HelpCard
              icon={<HelpCircle />}
              title="Puis-je être Participant ET Organisateur ?"
            >
              <p>
                Pour l'instant, vous devez choisir un rôle principal
                (Participant ou Organisateur) lors de l'inscription. Un compte
                Organisateur peut s'inscrire à d'autres événements, mais un
                compte Participant ne peut pas créer d'événement.
              </p>
            </HelpCard>
            <HelpCard
              icon={<HelpCircle />}
              title="La caméra ne se lance pas sur mon téléphone."
            >
              <p>
                Pour des raisons de sécurité, votre navigateur n'autorise la
                caméra que sur une connexion sécurisée <strong>(HTTPS)</strong>.
                Si vous testez en local, vous devez utiliser une URL
                `https://...` (par exemple, en déployant sur Render/Vercel ou en
                utilisant un outil comme `ngrok`).
              </p>
            </HelpCard>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default HelpPage;
