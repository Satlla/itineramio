import React from "react";
import "../css/components/discover.css";
import { Link } from "react-router-dom";

import {FormattedMessage } from 'react-intl'


function Discover() {
  return (

    <div>

      <div className="main-cont">

        <div className="container-hero">
          <div className="container-titles ">
            <img src="../assets/backgrounds/landscape.jpg" alt=""/>
            <div className="explorer-hero d-flex-column justify-content-center ">
              <h4 className="hero-subtitle">
                {" "}
                <FormattedMessage
                  id="app.welcome"
                  defaultMessage="¿No tienes claro dónde ir?. ¡Somos tu brújula!"
                  />

              </h4>
              <p className="hero-slogan">
                {" "}
                <FormattedMessage
                id="app.welcome2"
                defaultMessage="Lugares con encanto, sitios increíbles y experiencias únicas."

                />
              </p>
            </div>
            <div className="explore-itineramio d-flex justify-content-center">
              <Link to="/explore">
                <button className="btn-rounded">
                <FormattedMessage
                id="app.welcome.cta"
                defaultMessage="Explorar Lugares"
                 />
                </button>
              </Link>
            </div>
          </div>
    
        </div>
      </div>
    </div>

  );
}

export default Discover;
