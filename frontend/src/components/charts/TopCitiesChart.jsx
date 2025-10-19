import React from 'react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Text } from 'recharts'

const TopCitiesChart = ({ data }) => {
  // Fonction pour dessiner le label au-dessus de chaque barre
  const renderCustomLabel = (props) => {
    const { x, y, width, value, index } = props
    const city = data[index]
    return (
      <Text
        x={x + width / 2}
        y={y - 5}
        fill='#000'
        textAnchor='middle'
        fontSize={10}
      >
        {`${city.city}: ${value}\nLat:${city.lat},Lng:${city.lng}`}
      </Text>
    )
  }

  return (
    <div className='bg-white rounded-2xl p-4 shadow'>
      <h3 className='font-semibold mb-2'>Top 10 villes</h3>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={data}>
          <XAxis dataKey='city' />
          <Bar dataKey='value' fill='#3B82F6' label={renderCustomLabel} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TopCitiesChart
