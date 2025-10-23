import { useQuery } from '@tanstack/react-query'
import { StatCard } from '../../components/cards/StatCard'
import MainLayout from '../../components/layouts/MainLayout'
import EventCards from './Card'

import EventTabs from './EventTabs'
import { getDashboardStats } from '../../services/dashboardService'
import { Calendar, QrCode, Users } from 'lucide-react'

// DashboardPage
const DashboardPage = () => {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getDashboardStats,
  })
  return (
    <MainLayout>
      <div className='min-h-screen bg-gray-50 font-sans'>
        {/* Contenu principal du tableau de bord */}
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-8'>
            Tableau de bord - Liste des événements
          </h1>

          {/* Le tableau des événements est le seul composant actif ici */}

          <div className='p-6 bg-gray-50 min-h-screen'>
            <div className='grid grid-cols-4 gap-4 mb-6'>
              <StatCard
                title='Total Événements'
                value={stats?.totalEvents}
                color='bg-blue-600'
                icon={Calendar}
              />
              <StatCard
                title='Inscriptions'
                value={stats?.totalRegistrations}
                color='bg-purple-600'
                icon={Users}
              />
              <StatCard
                title='QR Validés'
                value={stats?.qrValidated}
                color='bg-green-600'
                icon={QrCode}
              />
            </div>
            <EventTabs />
          </div>
        </main>
      </div>
    </MainLayout>
  )
}
export default DashboardPage
