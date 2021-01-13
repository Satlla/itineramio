import React from 'react'
import { Link } from "react-router-dom";
import logo from "../assets/logos/isotipo.png";
import contactus from '../assets/viñetas/contact.png';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import bgbanner from '../assets/pages/plans/bgbig.jpg';
import bgbannersmall from '../assets/pages/plans/bgsmall.jpg';
import "../css/pages/plans.css";
import romantic from '../assets/pages/romantic.svg';
import museums from '../assets/pages/museum.svg';
import drinks from '../assets/pages/drinks.svg';
import traditional from '../assets/pages/traditional.svg';
import gourmet from '../assets/pages/gourmet.svg';
import aniversary from '../assets/pages/aniversary.svg';
import family from '../assets/pages/family.svg';
import group from '../assets/pages/group.svg';
import bg from '../assets/backgrounds/background-plans.jpg';
import plans from '../assets/pages/plans/plans-group.png';






function Plans() {
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
        <h1 className="title__banner"> Itineramio Plans</h1>
        <p className="slogan__banner">
          {" "}
          Dependiendo de lo que quieras hacer, aquí encontrarás tu plan.
        </p>

        <button className="btn-rounded-hiw"> Próximamente</button>

      </div>
      <img className="plans__banner" alt="plans" src={bgbannersmall}></img>
      <img className="plans__banner__big" alt="plans" src={bgbanner}></img>


    </header>

    <div className="about__us">
      <div classname="about__cont">

      <h2 className="about__title"> Descubre Plans</h2>
      <div className="slogan__container">
      <p className="slogan-bullet"> Lugares para visitar + gastronomía = Itineramios para compartir.</p>
      </div>
      </div>

    </div>

    <div className="nav__plans">
      <div className="plan">
        <img className="plan__categoryImage" src={romantic} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Romantic</span>
        <span> Parejas</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={family} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Con niños</span>
        <span> Familias</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={drinks} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Bebidas</span>
        <span> Vinos y Copas</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={museums} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Monumentos</span>
        <span> Arte</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={traditional} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Tradicional</span>
        <span> De la Zona</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={aniversary} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Aniversario</span>
        <span> Parejas</span>
       </div>

      </div>

      <div className="plan">
        <img className="plan__categoryImage" src={gourmet} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Gourmet</span>
        <span> Gastronomía</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={group} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Grupos</span>
        <span> Amigos</span>
       </div>

      </div>

    </div>

    <div className=" hero__plan">
      <img className="bann__img" src={plans} alt=""/>
      <div className="bann__content">

      <span className="bann__title"> Plans en Alicante</span>
      <span className="bann_slogan"> Dependiendo de tu estado de ánimo, puedes descubrir planes que mas se adaptan a tu mañana o tarde perfecta!. Desde una visita al museo mas importante de la ciudad con un piocteo rápido en la plaza más emblemática, hasta el mejor arroz con vistas al puerto y un café en pareja.</span>
      <button className="btn__outline__info"> Próximamente </button>

      </div>

    </div>

    <div className="contact_container mt-4">
      <img className="bullets__img mb-4" src={contactus}></img>
      <div className="contact-titles">

      <h4 className="contact__title"> ¡Contáctanos!</h4>
      <p> Si crees que hay algún plan en Alicante (provincia) que reúne los requisitos para ser visitado por nosotros y además superar la expectativas de acuerdo con nuestros estándares de calidad por favor contacta con nosotros </p>
      <p className="contact__email"> <span className="mailoutline"><MailOutlineIcon /> </span>hola@itineramio.com</p>

      </div>
    </div>

  </div>
);
}

export default Plans
