import React from "react";
import "../css/pages/hiw.css";
import city from "../assets/backgrounds/como-funciona.jpg";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import logo from "../assets/logos/logo-rojo.png";

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
          <h4 className="title__banner"> Conoce Itineramio </h4>
          <p className="slogan__banner">
            {" "}
            Te damos la bienvenida los mejores emplazamientos de Alicante
          </p>
        </div>
        <img className="image__banner" alt="whyus" src={city}></img>
      </header>
      <Footer />
    </div>
  );
}

export default AboutUs;
