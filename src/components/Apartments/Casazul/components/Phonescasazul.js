import React from "react";
import { Link } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import "../../styles.css";

function Phonescasazul() {
  window.scrollTo(0, 0);
  return (
    <div>
      <div className="cabecera">
        <Link className="header__whyus" to="/apartments/casazul/faq">
          <ChevronLeftIcon /> volver
        </Link>
      </div>

      <div className="layout__container">
        <ul class="listy mt-4">
          <li class="">
            Policia Nacional
            <span class="">091</span>
          </li>

          <li class="">
            Emergencias
            <span class="">112</span>
          </li>
          <li class="">
            Bomberos
            <span class="">112</span>
          </li>
          <li class="">
            Hospital
            <span class="">965 93 30 00</span>
          </li>
          <li class="">
            Policia Local
            <span class="">965 10 72 00</span>
          </li>
          <li class="">
            Anfitrión
            <span class="">652656440</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Phonescasazul;
