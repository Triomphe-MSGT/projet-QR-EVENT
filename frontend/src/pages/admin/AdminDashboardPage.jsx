import React from 'react'
import { useQuery } from '@tanstack/react-query'

import { Calendar, Users, QrCode, BarChart3 } from 'lucide-react'
import MainLayout from '../../components/layouts/MainLayout'

import CategoryChart from '../../components/charts/CategoryChart'
import TopCitiesChart from '../../components/charts/TopCitiesChart'
import PopularEvents from '../../components/Tables/PopularEvent'
import {
  getDashboardStats,
  getEventsByCategory,
  getPopularEvents,
  getRecentEvents,
  getTopCities,
} from '../../services/dashboardService'

import { StatCard } from '../../components/cards/StatCard'
import RecentEvents from '../../components/Tables/RecentEvents'

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getDashboardStats,
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getEventsByCategory,
  })
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: getTopCities,
  })
  const { data: popular } = useQuery({
    queryKey: ['popular'],
    queryFn: getPopularEvents,
  })
  const { data: recent } = useQuery({
    queryKey: ['recent'],
    queryFn: getRecentEvents,
  })

  return (
    <MainLayout>
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
          <StatCard
            title='Moyenne / Événement'
            value={stats?.avgPerEvent}
            color='bg-orange-500'
            icon={BarChart3}
          />
        </div>

        <div className='grid grid-cols-2 gap-4 mb-6'>
          <CategoryChart data={categories || []} />
          <TopCitiesChart data={cities || []} />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <PopularEvents events={popular || []} />
          <RecentEvents events={recent || []} />
        </div>
      </div>
    </MainLayout>
  )
}

export default AdminDashboard
