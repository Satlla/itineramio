import React from 'react'
import { Link } from "react-router-dom";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';


function Rulescasazul() {
  window.scrollTo(0, 0);

  return (
    <div>
        <div className="cabecera">
        <Link className="header__whyus" to="/apartments/casazul/faq">
          <ChevronLeftIcon/> volver
        </Link>
      </div>


    <div className="wifi__layout">
      <div className="container__wifi">
        <h4> Reglas y Normas Casa Azul </h4>
        <p> Quedan prohibidas dentro de la casa las siguientes acciones.</p>
        <hr></hr>
        <p> Fumar.</p>
        <hr></hr>
        <p> Hacer fiestas o eventos.</p>
        <hr></hr>
        <p> Hacer ruido desde las 23:00h hasta las 7:00h.</p>
        <hr></hr>
        <p> Entrada y estancia de mascotas. </p>
        <hr></hr>
        <p> Uso inadecuado de los electrodomésticos y demás elementos del alojamiento.</p>
        <hr></hr>
    
      </div>

  
    </div>
    </div>
  )
}


export default Rulescasazul
