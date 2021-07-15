
import React from "react";
import { Link } from "react-router-dom";
import VideoWashing from  '../assets/videos/washingmachinecasazulvid.mp4';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import '../../styles.css';

function Washingmachinecasazul() {
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
        <h5> Importante </h5>
<ul className="list-checkin">
  <li> En algunos casos, nos habéis dicho que la lavadora no funciona aun haciendo los pasos que aparecen en el video. Por favor comprueba que no esté encendido el led del temporidador ( 3, 6 o 9) esto sirve para programar la lavadora, si está activo, no se pondrá en marcha de momento. Se desactiva justo con el botón de la izquierda pulsando hasta que ninguno de los pilotos se encuentre encendido </li>
</ul>

      </div>
      <div className="video__container">


        <video className="video-item" width="100%" height="100% "  controls >
          <source src={ VideoWashing } type="video/mp4"/>
        </video>
      </div>
    </div>
    
    </div>
  );
}

export default Washingmachinecasazul;