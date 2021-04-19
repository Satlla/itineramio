import React, { useState } from "react";
import HeaderTransparent from "../../HeaderTransparent";
import Navigation from './Navigation';
import "../../../css/components/dashboard.css";
import Faq from './components/Faq';
import Portada from './assets/imgs/faqwall.jpg'

function EnriquetaLoft() {

  const [faqs, setFaqs] = useState([
    {
      question: '¿Cómo hago Check in en Enriqueta Loft Jacuzzi?',
      answer: 'Cuando llegues a Calle Enriqueta numero 26, encontrarás dos puertas blancas, la de la izquierda es la comunitaria del edificio, para acceder a tu apartamento deberás abrir la puerta de la derecha. Verás un candado colgado de la puerta, solicita al Administrador el código para acceder dentro de la vivienda. Recuerda que para tu Check in, deberás depositar de nuevo la llave en el mismo lugar.',
      open: false
    },
    {
      question: '¿Cómo programo la tele?',
      answer: ' La tele funciona como una tele normal',
      open: false
    },
    {
      question: '¿Cómo pongo en funcionamiento el jacuzzi?',
      answer: ' El jacuzzi deberás llenarlo primero hasta cubrir todos los chorros y después se accionará pulsando el botón',
      open: false
    }

  ]);

  const toggleFAQ = index => {
    setFaqs(faqs.map((faq, i) => {
      if (i === index) {
        faq.open = !faq.open
      } else {
        faq.open = false;
      }

      return faq;
    }))
  }



  return (
    <div>
      <HeaderTransparent />
      <div className="cover-container">

        <img className="cover__page" src={ Portada } alt=""/>
      </div>
      <div className="faq__container">
        <div className="faq__title">

        <h3>  Bienvenidx a Enriqueta Loft</h3>
        <small className="small__title">Manual del Huésped</small>
        </div>
      </div>
      <div className="orbital__panel_dashboard">

        <div className="mainer">
          <Navigation />

          <div className="faqs">
        {faqs.map((faq, i) => (
          <Faq faq={faq} index={i} toggleFAQ={toggleFAQ} />
        ))}
      </div>
        </div>
      </div>
    </div>
  );
}

export default EnriquetaLoft;