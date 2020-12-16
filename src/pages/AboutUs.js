import React from 'react'
import '../css/pages/aboutus.css'
import city from '../assets/backgrounds/city.png'

function AboutUs() {
  return (
    <div>
      <header className="header__about"> </header>
      <h4 className="title__banner"> ¿Que es itineramio? </h4>
      <p className="slogan__banner">¡Te damos la bienvenida a la comunidad de itineramio!. Dependiendo de tu #mood, aquí tienes tu plan!</p> 
      <span> <img className="img_banner"src={city}></img></span>
    </div>
  )
}

export default AboutUs
