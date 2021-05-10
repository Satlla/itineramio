import React, { useState } from "react";
import HeaderTransparent from "../../HeaderTransparent";
import Navigation from './Navigationazul';
import "../../../css/components/dashboard.css";
import Faq from '../Base/Faq';
import Portada from './assets/imgs/faqwall.jpg'
import Data from '../Base/DataCasazul.json'

function Casazul() {

  const [faqs, setFaqs] = useState(Data);

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

        <h3>  Bienvenidx a la Casa Azul </h3>
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

export default Casazul;