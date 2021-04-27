
import React from "react";
import { Link } from "react-router-dom";
import videotv from  '../assets/videos/tvcasazul.mp4';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import '../../styles.css';

function Tvcasazul() {
  window.scrollTo(0, 0);
  return (
    <div>
         <div className="cabecera">
        <Link className="header__whyus" to="/apartments/casazul/faq">
          <ChevronLeftIcon/> volver
        </Link>
      </div>


    <div className="layout__container">
      <div className="title__container__checkin">
        <h5> Instrucciones cambio de idioma TV</h5>
      </div>
      <div className="video__container">


        <video className="video-item" width="100%" height="100% "  controls >
          <source src={ videotv } type="video/mp4"/>
        </video>
      </div>
    </div>
    
    </div>
  );
}

export default Tvcasazul;