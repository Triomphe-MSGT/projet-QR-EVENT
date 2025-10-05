import AuthForm2 from './components/ui/AuthForm2'

import UserProfile from './components/userProfile'

import OrganizerProfile from './pages/organizer/ProfilOrganisateur'
const App = () => {
  return (
    <>
      {/* <AuthForm2 /> */}
      <div>
        <h1 className='text-3xl font-extrabold font-[Poppins] text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400 mb-6'>
          Mon Profil
        </h1>
        <UserProfile />
        <hr />
        {/* <OrganizerProfile /> */}
      </div>
    </>
  )
}
export default App
