import React, {useRef, useState } from 'react'
import '../../styles.css';
import { Link, useParams } from "react-router-dom";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';


function Wifie4() {
  window.scrollTo(0, 0);
  console.log(useParams())
  const [copySuccess, setCopySuccess] = useState('');
  const textAreaRef = useRef(null);

  function copyToClipboard(e) {
    textAreaRef.current.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the whole text area selected.
    e.target.focus();
    setCopySuccess('Copiado!');
  };
  return (
    <div>
        <div className="cabecera">
        <Link className="header__whyus" to="/apartments/enriqueta4/faq">
          <ChevronLeftIcon/> volver
        </Link>
      </div>

      

    <div className="wifi__layout">
      <div className="container__wifi">
        <h4> Wifi </h4>
        <hr></hr>
        <p> Nombre de la red Wifi</p>
        <h6> GALLEGOCASA4</h6>
        <hr></hr>
        <p> Contraseña del Wifi</p>
        <h6> </h6>
        <form>
        <textarea 
          className="textareawifi"
          ref={textAreaRef}
          value='ENRIQUETA264'
          />
      </form>
          <hr></hr>
      {
       /* Logical shortcut for only displaying the 
          button if the copy command exists */
       document.queryCommandSupported('copy') &&
        <div>
          <button className="cta__rounded" onClick={copyToClipboard}>Copiar Password</button> 
          {copySuccess}
        </div>
      }
      </div>

  
    </div>
    </div>
  )
}

export default Wifie4
