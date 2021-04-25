
import React from "react";
import { Link } from "react-router-dom";
import Videovitro from  '../assets/videos/vitroe4.mp4';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import '../../styles.css';

function Vitro() {
  window.scrollTo(0, 0);
  return (
    <div>
         <div className="cabecera">
        <Link className="header__whyus" to="/apartments/enriqueta4/faq">
          <ChevronLeftIcon/> volver
        </Link>
      </div>


    <div className="layout__container">
      <div className="video__container">

        <video className="video-item" width="100%" height="100% "  controls >
          <source src={Videovitro} type="video/mp4"/>
        </video>
      </div>
    </div>
    </div>
  );
}

export default Vitro;