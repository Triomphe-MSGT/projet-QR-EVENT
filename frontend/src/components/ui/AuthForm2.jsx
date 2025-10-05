import { useState } from 'react'
import Button from './Button/'
import Togglable from './Togglable'
import AuthForm from './AuthForm'
const AuthForm2 = ({}) => {
  //on met a jour l'element value avec le texte qui est dans l'input
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Login data submitted:', { email, password })
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <Togglable
        title='Qr-Event'
        firstTabLabel='inscription'
        secondTabLabel='connexion'
        firstTabContent={<AuthForm />}
      >
        <form onSubmit={handleSubmit} className='space-y-6'>
          <h2 className='text-2xl font-bold text-center text-gray-800'>
            Se connecter
          </h2>
          <div>
            <label className='sr-only' htmlFor='email'>
              Adresse e-mail
            </label>
            <input
              id='email'
              type='email'
              value={email}
              placeholder='Adresse e-mail'
              onChange={({ target }) => setEmail(target.value)}
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='sr-only' htmlFor='password'>
              Mot de passe
            </label>
            <input
              id='password'
              type='password'
              placeholder='Mot de passe'
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <Button
            text='Se connecter'
            colorClass='w-full bg-blue-600 text-white hover:bg-blue-700'
          />
          <div className='text-center text-sm text-blue-600 mt-2'>
            <a href='#' className='hover:underline'>
              Mot de passe oublié ?
            </a>
          </div>
          <div className='text-center my-6 text-gray-400'>- OU -</div>
          <Button
            text='Continuer avec Google'
            onClick={() => console.log('Google login clicked')}
            colorClass='w-full flex items-center justify-center gap-2 bg-white text-black border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition'
            icon={
              <img
                src='https://developers.google.com/identity/images/g-logo.png'
                alt='Google logo'
                className='w-5 h-5'
              />
            }
          />
        </form>
      </Togglable>
    </div>
  )
}

export default AuthForm2
