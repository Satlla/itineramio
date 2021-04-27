
import React from "react";
import { Link } from "react-router-dom";
import videocheckine4 from  '../assets/videos/checkincasazul.mp4';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import '../../styles.css';

function Checkincasazul() {
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
        <h5> Instrucciones de Check In </h5>
<ul className="list-checkin">
  <li> Cuando llegues a Calle Trafalgar número 99 , deberás poner el código que te indique el anfitrión para entrar en el apartamento, tal y como te indica el siguiente vídeo. Recordarte que las entradas son a partir de las 16:00h salvo acuerdo previo con el gestor del apartamento </li>

</ul>

      </div>
      <div className="video__container">


        <video className="video-item" width="100%" height="100% "  controls >
          <source src={ videocheckine4 } type="video/mp4"/>
        </video>
      </div>
    </div>
    
    </div>
  );
}

export default Checkincasazul;