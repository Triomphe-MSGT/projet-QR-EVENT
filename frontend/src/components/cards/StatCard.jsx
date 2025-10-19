import React from 'react'

export const StatCard = ({ title, value, color, icon: Icon }) => {
  return (
    <div className={`p-4 rounded-2xl shadow-sm text-white ${color}`}>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium opacity-80'>{title}</h3>
          <p className='text-2xl font-bold'>{value}</p>
        </div>
        <Icon size={28} />
      </div>
    </div>
  )
}
