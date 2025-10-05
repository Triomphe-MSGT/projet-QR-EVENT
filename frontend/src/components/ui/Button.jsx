// Button.jsx
const Button = ({ text, onClick, colorClass, icon }) => {
  return (
    <button
      onClick={onClick}
      className={` font-bold py-3 px-4 rounded-lg focus:outline-none transition duration-300 ease-in-out shadow-md hover:shadow-lg ${colorClass}`}
    >
      {icon && <span className='mr-2'>{icon}</span>}
      {text}
    </button>
  )
}

export default Button
