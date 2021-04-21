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
      answer: 'Cuando llegues a Calle Enriqueta numero 26, encontrarás dos puertas blancas, la de la izquierda es la comunitaria del edificio, para acceder a tu apartamento deberás abrir la puerta de la derecha. Verás un candado colgado de la puerta, solicita al Administrador el código para acceder dentro de la vivienda. Recuerda que para tu Check out, deberás depositar de nuevo la llave en el mismo lugar.',
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
    },
    {
      question: '¿Cómo hago CheckOut del apartamento?',
      answer: ' El día de tu CheckOut es muy importante que dejes los grifos y ventanas cerrados, luces y aire acondicionado apagados, televisión apagada, no te preocupes por la limpieza de sábanas, no es necesario que las dobles ni las metas en la lavadora, el servicio de lavandería se encargará de ello!. Deposita las llaves en el candado. Avisa al anfitrion (Alex) que has abandonado el apartamento para que pase parte a limpieza. ¡Esperamos que hayas tenido una estancia agradable!  ',
      open: false
    },
    {
      question: '¿Hay algún supermercado cerca?',
      answer: 'Supermercado Dialprix en Calle Pintor Gisbert 9 Abre a las 9:00h, Si necesitas un 24h para compras de emergencia En la Plaza General Mancha Nº 2 "Deshoras"   ',
      open: false
    },
    {
      question: '¿Hay algún lugar para imprimir mis billetes de avión?',
      answer: ' Papelería "3 Tipos Imprenta" Calle Padre Recaredo de Los Rios, 40, 03005 Alicante ',
      open: false
    },
    {
      question: '¿Hay alguna Consigna de maletas ?',
      answer: ' Cerca del mercado central podrás dejar las maletas en Luggage Alicante, es una consigna de equipajes cuya reserva solo está permitida a través de su pagina web -> www.luggagealicante.com 24 Hour Luggage Storage (Consigna) Alicante City Center.   ',
      open: false
    },
    {
      question: '¿Cómo llego al apartamento desde el aeropuerto ?',
      answer: ' La mejor manera para llegar es mediante Taxi o Cabify (App como uber), el precio aproximado es de 20€-25€, la ventaja principal es que te deja en la misma puerta del apartamento por lo que no deberás preocuparte por nada. La opción B es mediante el Autobús C-6, cuesta en torno a 3,6€ y lo cogerás en el aeropuerto y tu parada será la de Renfre, a escasos 4 minutos andando del apartamento --> Calle Enriqueta Ortega 26 Bajo ',
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