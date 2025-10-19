import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#6366F1', '#A855F7', '#FACC15', '#F87171'] // ajoute plus de couleurs si nécessaire

const CategoryChart = ({ data }) => {
  // Calcul du total pourcentage
  const total = data.reduce((sum, cat) => sum + cat.value, 0)
  const dataWithPercentage = data.map((cat) => ({
    ...cat,
    percentage: ((cat.value / total) * 100).toFixed(1), // 1 chiffre après la virgule
  }))

  return (
    <div className='bg-white rounded-2xl p-4 shadow'>
      <h3 className='font-semibold mb-2'>Événements par catégorie</h3>

      <ResponsiveContainer width='100%' height={250}>
        <PieChart>
          <Pie
            data={dataWithPercentage}
            dataKey='value'
            nameKey='name'
            outerRadius={80}
            label={({ name, percentage }) => `${name}: ${percentage}%`} // affichage hors du cercle
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CategoryChart
