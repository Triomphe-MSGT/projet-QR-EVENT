import { useState } from 'react'
import Button from './Button'

const Togglable = (props) => {
  const [visible, setVisible] = useState(false)
  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibilityinscription = () => setVisible(false)
  const toggleVisibilityconnexion = () => setVisible(true)

  return (
    <div className='bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm transform transition-all duration-300'>
      <h1 className='text-3xl font-extrabold font-[Poppins] text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400 mb-6'>
        {props.title}
      </h1>

      {/* Onglets */}
      <div className='flex justify-center mb-6 border-b-2 border-gray-200'>
        <Button
          onClick={toggleVisibilityinscription}
          text={props.firstTabLabel}
          colorClass={` pb-2 text-center font-semibold transition-colors  ${
            !visible
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          } `}
        />
        <Button
          onClick={toggleVisibilityconnexion}
          text={props.secondTabLabel}
          colorClass={`pb-2 text-sm font-semibold transition-colors ${
            visible
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          } `}
        />
      </div>

      {/* Contenu */}
      <div style={hideWhenVisible}>{props.firstTabContent}</div>
      <div style={showWhenVisible}>{props.children}</div>
    </div>
  )
}

export default Togglable
