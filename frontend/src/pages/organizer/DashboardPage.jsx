import MainLayout from '../../components/layouts/MainLayout'
import EventCards from './Card'

import EventTabs from './EventTabs'

// DashboardPage
const DashboardPage = () => {
  return (
    <MainLayout>
      <div className='min-h-screen bg-gray-50 font-sans'>
        {/* Contenu principal du tableau de bord */}
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-8'>
            Tableau de bord - Liste des événements
          </h1>

          {/* Le tableau des événements est le seul composant actif ici */}

          <EventCards />
          
          <EventTabs />
        </main>
      </div>
    </MainLayout>
  )
}
export default DashboardPage
