import React, { useState } from "react";
import HeaderTransparent from "../../HeaderTransparent";
import Navigation from './Navigatione4';
import "../../../css/components/dashboard.css";
import Faq from './components/Faqe4';
import Portada from './assets/imgs/faqwall.jpg'

function Enriqueta4() {

  const [faqs, setFaqs] = useState([
    // {
    //   question: '¿Cómo hago Check in en Enriqueta Loft Jacuzzi?',
    //   answer: 'Cuando llegues a Calle Enriqueta numero 26, encontrarás dos puertas blancas, la de la izquierda es la comunitaria del edificio, para acceder a tu apartamento deberás abrir la puerta de la derecha. Verás un candado colgado de la puerta, solicita al Administrador el código para acceder dentro de la vivienda. Recuerda que para tu Check out, deberás depositar de nuevo la llave en el mismo lugar.',
    //   open: false
    // },
    // {
    //   question: '¿Cómo programo la tele?',
    //   answer: ' La tele funciona como una tele normal',
    //   open: false
    // },
    // {
    //   question: '¿Cómo pongo en funcionamiento el jacuzzi?',
    //   answer: ' El jacuzzi deberás llenarlo primero hasta cubrir todos los chorros y después se accionará pulsando el botón',
    //   open: false
    // },
    {
      question: '¿Cómo llego al apartamento desde el Aeropuerto ?',
      answer: ' La mejor manera para llegar es mediante Taxi o Cabify (App como uber), el precio aproximado es de 20€-25€, la ventaja principal es que te deja en la misma puerta del apartamento por lo que no deberás preocuparte por nada. La opción B es mediante el Autobús C-6, cuesta en torno a 3,6€ y lo cogerás en el aeropuerto y tu parada será la de Renfre, a escasos 4 minutos andando del apartamento --> Calle Enriqueta Ortega 26 Bajo ',
      open: false
    },
    {
      question: '¿Hay alguna consigna de maletas ?',
      answer: ' Cerca del mercado central podrás dejar las maletas en Luggage Alicante, es una consigna de equipajes cuya reserva solo está permitida a través de su pagina web -> www.luggagealicante.com 24 Hour Luggage Storage (Consigna) Alicante City Center.   ',
      open: false
    },
    {
      question: '¿Hay algún supermercado cerca?',
      answer: 'Supermercado Dialprix en Calle Pintor Gisbert 9 Abre a las 9:00h, Si necesitas un 24h para compras de emergencia En la Plaza General Mancha Nº 2 "Deshoras"   ',
      open: false
    },

     {
      question: '¿Dónde encuentro una farmacia?',
      answer: ' En horario laboral, justo al lado del alojamiento se encuentra : Lda Ma C. Delgafo Perez en la calle Tato, si tienes una emergencia la farmacia trebol abre 24h, está situada en Calle, Avenida Pintor Xavier Soler, 2, Local 4 - 7, 03015 Alicante 965 91 02 20 ',
      open: false
     },

    {
      question: '¿ Hay alguna tintorería cerca  ?',
      answer: ': Tintorería Mati -> Calle Antonio Martín Trenco, 14, local 4, 03005 Alicante". Telf : 965 22 90 46   ',
      open: false
    },

    {
      question: '¿Dónde puedo imprimir mis billetes de avión?',
      answer: ' Copistería Rusan Copy Flash Av. Salamanca, 24, 03005 Alicante"   ',
      open: false
    },



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

        <h3>  Bienvenidx a Enriqueta 4</h3>
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

export default Enriqueta4;