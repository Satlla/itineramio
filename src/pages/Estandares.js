import React from "react";
import "../css/pages/estandares.css";
import { Link } from "react-router-dom";
import logo from "../assets/logos/logo-rojo.png";
import gastronomia from '../assets/img/gastronomia.jpg'
import limpieza from '../assets/img/limpieza.jpg'
import arroz from '../assets/img/arroz.jpg'
import detalles from '../assets/img/detalles.jpg'
import { Helmet } from "react-helmet";


function Estandares() {
  window.scrollTo(0, 0);
  return (
    <div>
      <Helmet>
        <meta property="og:title" content="Itineramio| Estándares de calidad " />
        <meta name="description" content=" Normas básicas que deben reunir todos los establecimientos, para poder pertenecer a la comunidad Itineramio" />
        <link rel="canonical" href=" https://www.itineramio.com/estandares" />
        <meta property="og:image" content="https://miro.medium.com/max/812/1*1xhuVp8f2WFUGUByHS8VTg.png" />
       

      </Helmet>

      <div className="cabecera">
        <Link className="header__whyus" to="/">
          <img className="logo_banner" src={logo} alt="logo" />
        </Link>
      </div>

      <div className="container-title">
        <h4 className="banner-title"> Estándares de Calidad </h4>
      </div>

      <div className="container-cards"> 
      <div className="cards">

      {/* Oferta gastronomica */}
        <div className="estandar__card_1 mb-4">
          <div className="descriptions-card">
            <h3 className="title-card"> Oferta Gastronómica</h3>
          <p> La calidad de la oferta de platos es la base, es posible que el establecimiento no tenga una decoración excelente, o no esté en primera linea de playa, pero el producto debe ser de calidad!</p>
          </div>

          <div className="container-image">
            <img  className="image-card"src={ gastronomia } alt="oferta gastronomica"/>
          </div>
        </div>
        <div className="estandar__card_2 mb-4">
        <div className="container-image">
            <img  className="image-card"src={ limpieza } alt="oferta gastronomica"/>
          </div>
          <div className="descriptions-card">
            <h3 className="title-card"> Limpieza</h3>
          <p> Necesitamos un mínimo de higiene, no pasamos el dedo por la barra ni revisamos el establecimiento, pero el balance debe ser positivo. ¡Nos encanta visitar lugares limpios y seguros! </p>
          </div>

        </div>

 {/* Decoracion y Detalles */}

        <div className="estandar__card_3 mb-4">
          <div className="descriptions-card">
            <h3 className="title-card"> Decoración y detalles</h3>
          <p> Nos apasiona encontrar espacios decorados con gusto, mimo y encanto. Desde una librería entre aparadores, hasta un rinconcito con chimenea sin duda captará nuestra atención!. Para nosotros los detalles suman... y mucho!</p>
          </div>

          <div className="container-image">
            <img  className="image-card"src={ detalles } alt="oferta gastronomica"/>
          </div>
        </div>
        <div className="estandar__card_4 mb-4">
        <div className="container-image ">
            <img  className="image-card"src={ arroz } alt="oferta gastronomica"/>
          </div>
          <div className="descriptions-card">
            <h3 className="title-card"> Un arroz de altura</h3>
          <p> Estamos en Alicante, y no podemos fallar en platos típicos de la zona. El arroz es sin duda nuestra debilidad y para poder publicar un restaurante arrocero, necesitamos que este sea toda una experiencia!.</p>
          </div>

        </div>

     

      </div>

      </div>
    </div>
  );
}

export default Estandares;
