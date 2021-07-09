import React from "react";
import "../css/components/discover.css";
import { Link } from "react-router-dom";
import foto1 from "../assets/img/fotoportada.jpg";
import foto2 from "../assets/img/cafe2.jpg";
import foto3 from "../assets/img/restaurant.jpg";
import foto4 from "../assets/img/restaurant2.jpg";
import {FormattedMessage } from 'react-intl'


function Discover() {
  return (

      <div className="main-cont mb-4">
        <div className="container-hero">
          <div className="container-titles">
            <div className="explorer-hero">
              <h3 className="hero-subtitle">
                {" "}
                <FormattedMessage
                  id="app.welcome"
                  defaultMessage="¿No tienes claro dónde ir?. ¡Somos tu brújula!"
                  />

              </h3>
              <p className="hero-slogan">
                {" "}
                <FormattedMessage
                id="app.welcome2"
                defaultMessage="Lugares con encanto, sitios increíbles y experiencias únicas."

                />
              </p>
            </div>
            <div className="explore-itineramio">
              <Link to="/explore">
                <button className="btn-rounded">
                <FormattedMessage
                id="app.welcome.cta"
                defaultMessage="Explorar"
                 />
                </button>
              </Link>
            </div>
          </div>
          <div className="grid-container">
            <div className="item1">
              <img src={foto1} className="hero-img" alt="cafe" />
            </div>
            <div className="item2">
              <img src={foto2} className="hero-img" alt="cafe" />
            </div>
            <div className="item3">
              <img src={foto3} className="hero-img" alt="cafe" />
            </div>
            <div className="item4">
              <img src={foto4} className="hero-img" alt="cafe" />
            </div>
          </div>
        </div>
      </div>
  );
}

export default Discover;
