// import Button from './components/ui/Button'
import { useState, useEffect } from 'react'
import React from 'react'
const HomePage = () => {
  const images = [
    'C:UsersKTIPicturesChoisir des brosses à dents recyclables.jpeg',
    'C:UsersKTIPicturesChoisir des brosses à dents recyclables.jpeg',
    'C:UsersKTIPicturesChoisir des brosses à dents recyclables.jpeg',
    'C:UsersKTIPicturesChoisir des brosses à dents recyclables.jpeg',
  ]

  const Carousel = () => {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length)
      }, 4000)
      return () => clearInterval(interval)
    }, [])

    return (
      <div>
        {images.map((img, index) => (
          <img key={index} src={img} alt={`slide-${index}`} />
        ))}
      </div>
    )
  }

  const Description = () => {
    return (
      <section
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <h2>Bienvenue sur QR-Event</h2>
        <p
          style={{
            maxWidth: '700px',
            margin: '1rem auto',
            lineHeight: '1.6',
            fontSize: '1.1rem',
          }}
        >
          Vous voulez être au courant des différents événements à travers le
          monde, sans tracas ?<br />
          Vous souhaitez organiser des événements accessibles à tous, partout ?
          <br />
          Ne cherchez plus, vous êtes sur la bonne plateforme !<br />
          <br />
          <strong>QR-Event</strong> est une plateforme de gestion d'événements
          qui vous permet :<br />
          - de vous inscrire à des événements directement depuis votre
          smartphone,
          <br />
          - de faire connaître vos propres événements au monde entier.
          <br />
          <br />
          Nous vous promettons une expérience utilisateur unique et sans
          précédent.
          <br />
          <br />
        </p>
      </section>
    )
  }

  return (
    <>
      <h1>qr-event</h1>
      <div>
        <Carousel />
      </div>
      <div>
        <Description />
      </div>
      {/* <div>
        <Button text='commencer' />
      </div> */}
    </>
  )
}
export default HomePage
