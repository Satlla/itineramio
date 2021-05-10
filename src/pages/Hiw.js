import React from "react";
import "../css/pages/hiw.css";
import city from "../assets/backgrounds/como-funciona.jpg";
import citybig from "../assets/backgrounds/backgroundbig.jpg";
import { Link } from "react-router-dom";
import logo from "../assets/logos/logo-rojo.png";
import people from '../assets/viñetas/itinepeople.jpg';
import couple from '../assets/viñetas/restaurant-couple.jpg';
import restaurant from '../assets/viñetas/restaurant.jpg';
import contactus from '../assets/viñetas/contact.png';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import {FormattedMessage} from 'react-intl';



function AboutUs() {
  window.scrollTo(0, 0);
  return (
    <div>
      <div className="cab">
        <Link className="header__whyus" to="/">
          <img className="logo_banner" src={logo} alt="logo" />
        </Link>
      </div>

      <header className="header__about">
        <div className="cta__banner">
          <h1 className="title__banner"> 
          <FormattedMessage
          id="hiw.title"
          defaultMessage="Lugares Mágicos"

          />
          </h1>
          <p className="slogan__banner">
            {" "}
            <FormattedMessage
            id="hiw.slogan"
            defaultMessage="Dependiendo de dónde quieras estar, itineramio te dice el lugar"

            />
          </p>
          <Link to="/explore">
          <button className="btn-rounded-hiw">
            <FormattedMessage
            id="hiw.cta"
            defaultMessage="Explorar Lugares"
            />
          </button>
          </Link>
        </div>
        <img className="image__banner" alt="whyus" src={city}></img>
        <img className="image__banner-big" alt="whyus" src={citybig}></img>

      </header>

      <div className="about__us">
        <div classname="about__cont">

        <h2 className="about__title"> 
        <FormattedMessage
        id="hiw.title1"
        defaultMessage="¿Qué es itineramio?"
        />
        </h2>
        <div className="slogan__container">
        <p className="slogan-bullet"> 
        <FormattedMessage
        id="hiw.description1"
        defaultMessage="Nuestra mayor obsesión es, hacer que cada usuarix encuentre el lugar que necesita visitar, reduciendo el tiempo de búsqueda y margen de error. Desde una vieja taberna con cocina de estrella, hasta un lugar mágico para tomar el mejor café en pareja."
        />
        </p>
        </div>
        </div>

      </div>
      <div className="bullets">

      <div className="bullet">
        <img className="bullets__img"src={restaurant}></img>
        <h4> 
          <FormattedMessage
          id="hiw.title2"
          defaultMessage="Impulso Local"
          />
          
          </h4>
        <span>
          <FormattedMessage
          id="hiw.description2"
          defaultMessage="Plataforma creada para impulsar la gastronomía local tradicional y los mejores emplazamientos de la ciudad. 
          "
          />
        </span>

        </div>
        <div className="bullet mt-3">
        <img className="bullets__img"src={couple}></img>
        <h4>
          <FormattedMessage
          id="hiw.title3"
          defaultMessage="Experiencias Top"
          />
        </h4>
        <span>
          <FormattedMessage
          id="hiw.description3"
          defaultMessage="Solo forman parte los lugares que generan experiencias 100% satisfactorias en el cliente final bajo nuestros estándares."
          />
        </span>

        </div>
        <div className="bullet mt-3">
        <img className="bullets__img"src={people}></img>
        <h4>
          <FormattedMessage
          id="hiw.title4"
          defaultMessage="Objetividad"
          />

        </h4>
        <span>
          <FormattedMessage
            id="hiw.description4"
            defaultMessage="Nos basamos en opiniones propias visitando el lugar personalmente, pensando siempre en el cliente final."
          />
        </span>

        </div>
      </div>

      <div className="contact_container mt-4">
        <img className="bullets__img mb-4" src={contactus}></img>
        <div className="contact-titles">

        <h4 className="contact__title">
          <FormattedMessage
          id="hiw.contact"
          defaultMessage=" ¡Contáctanos!"
          />
        </h4>
        <p>
          <FormattedMessage
          id="hiw.contact.description"
          defaultMessage="Si crees que hay algún restaurante en Alicante (provincia) que reúne los requisitos para ser visitado por nosotros y además superar la expectativas de acuerdo con nuestros estándares de calidad por favor contacta con nosotros "
          />
        </p>
        <p className="contact__email"> <span className="mailoutline"><MailOutlineIcon /> </span>hola@itineramio.com</p>

        </div>
      </div>

    </div>
  );
}

export default AboutUs;
