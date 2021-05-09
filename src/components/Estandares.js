import React from "react";
import "../css/components/estandares2.css";
import { Link } from "react-router-dom";
import estandaresimg from "../assets/img/banner1.webp";
import estandaresimg2 from "../assets/img/bann2.jpg";
import { FormattedMessage } from 'react-intl';

function Estandares() {
  return (
    // <div className="estandares-layout">
    //   <div className="estandares-grid">
    //     <div className="estandares-container">
    //       <div className="estandares-cta">
    //         <h3 className="estandares-title"> Estándares de Calidad</h3>
    //         <p className="estandares-description">
    //           {" "}
    //           Descubre los must que debe tener cualquier establecimiento para
    //           aparecer en Itineramio
    //         </p>
    //         <button> Mas información</button>
    //       </div>
    //       <div className="estandares-img">
    //         <img  className="stand-img" src={estandaresimg} alt="" />
    //       </div>

    //     </div>
    //   </div>
    // </div>
    <div className="estandares-layout">
    <div className="estandares-grid">
      <div className="estandares-container">
        <div className="estandares-cta">
          <h3 className="estandares-title">
          <FormattedMessage
            id="quality.standard"
            defaultMessage="Estándares de Calidad"
            />
          </h3>
          <p className="estandares-description">
            {" "}
            <FormattedMessage
            id="quality.standard.slogan"
            defaultMessage="Descubre los must que debe tener cualquier establecimiento para aparecer en Itineramio"
            />
            </p>
          <Link to="/estandares">
          <button className="estandares-btn"> 
          <FormattedMessage
            id="quality.standard.cta"
            defaultMessage="Mas Información"
            />
          </button>
          </Link>

        </div>
        <div className="estandares-img">
          <img  className="stand-img" src={estandaresimg} alt="" />
          <img  className="stand-img2" src={estandaresimg2} alt="" />
        </div> 

      </div>
    </div>
  </div>
  );
}

export default Estandares;
