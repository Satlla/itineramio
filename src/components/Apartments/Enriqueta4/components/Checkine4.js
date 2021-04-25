
import React from "react";
import { Link } from "react-router-dom";
import videocheckine4 from  '../assets/videos/videocheckine4.mp4';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import '../../styles.css';

function Checkin4() {
  window.scrollTo(0, 0);
  return (
    <div>
         <div className="cabecera">
        <Link className="header__whyus" to="/apartments/enriqueta4/faq">
          <ChevronLeftIcon/> volver
        </Link>
      </div>


    <div className="layout__container">
      <div className="title__container__checkin">
        <h5> Instrucciones de Check In </h5>
<ol className="list-checkin">
  <li>Cuando llegues a Calle Enriqueta número 26, deberás poner el código 7890 para entrar en la portería. </li>
  <li> Después sube hasta la segunda planta y tu apartamento es el primero de la derecha. El apartamento 4. </li>
  <li>Sigue las instrucciones que tienes justo debajo para poder acceder al apartamento. El código te lo proporcionará el anfitrión por teléfono.
</li>
</ol>

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

export default Checkin4;