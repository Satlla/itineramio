import React from "react";
import "../css/pages/hiw.css";
import city from "../assets/backgrounds/como-funciona.jpg";
import { Link } from "react-router-dom";
import logo from "../assets/logos/logo-rojo.png";
import people from '../assets/viñetas/itinepeople.png';

function AboutUs() {
  return (
    <div>
      <div className="cab">
        <Link className="header__whyus" to="/">
          <img className="logo_banner" src={logo} alt="logo" />
        </Link>
      </div>

      <header className="header__about">
        <div className="cta__banner">
          <h1 className="title__banner"> Lugares Mágicos </h1>
          <p className="slogan__banner">
            {" "}
            Dependiendo de dónde quieras estar, itineramio te dice el lugar
          </p>
          <Link to="/explore">
          <button className="btn-rounded"> Explorar Lugares</button>
          </Link>
        </div>
        <img className="image__banner" alt="whyus" src={city}></img>
      </header>
      <div className="bullets"> 
        
      <div className="bullet">
        <img className="bullets__img"src={people}></img>
        <h4> Objetividad </h4>
        <span> La plataforma está pensada 100% para el cliente que visita los lugares y toda la información trata de ser siempre objetiva.</span>

        </div>
        <div className="bullet">
        <img className="bullets__img"src={people}></img>
        <h4> Objetividad </h4>
        <span> La plataforma está pensada 100% para el cliente que visita los lugares y toda la información trata de ser siempre objetiva.</span>

        </div>
        <div className="bullet">
        <img className="bullets__img"src={people}></img>
        <h4> Objetividad </h4>
        <span> La plataforma está pensada 100% para el cliente que visita los lugares y toda la información trata de ser siempre objetiva.</span>

        </div>
      </div>
     
    </div>
  );
}

export default AboutUs;
