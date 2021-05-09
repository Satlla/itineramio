import React from "react";
import "../css/components/bullets.css";
import img1 from "../assets/viñetas/1.jpg";
import img2 from "../assets/viñetas/2.jpg";
import img3 from "../assets/viñetas/3.jpg";
import {FormattedMessage} from 'react-intl';



function Bullets() {
  return (
    <div className="container-bullets">

       <h3 className="title-container">
       <FormattedMessage
              id="quality.why"
              defaultMessage=" ¿Por qué itineramio?"

              />
       </h3>

    <div className="bullet-group">
        <div className="list-group-bullet">
          <img src={img1} className="image-bullet" alt="razon-de-ser" />
          <p className="title-bullet">
            <FormattedMessage
            id="bullets.quality"
            defaultMessage="Calidad"
            />
          </p>
          <p>
          <FormattedMessage
            id="bullets.quality.slogan"
            defaultMessage="Valoramos los lugares que visitanos personalmente, de acuerdo con nuestros estándares de calidad"
            />
          </p>
        </div>
        <div className="list-group-bullet">
          <img src={img2} className="image-bullet" alt="razon-de-ser" />
          <p className="title-bullet">
          <FormattedMessage
            id="bullets.objectivity"
            defaultMessage="Objetividad"
            />

            </p>
          <p>
          <FormattedMessage
            id="bullets.objectivity.slogan"
            defaultMessage="No estamos influenciados por marcas o empresas por lo que prima la transparencia y objetividad"
            />
          </p>
        </div>
        <div className="list-group-bullet">
          <img src={img3} className="image-bullet" alt="razon-de-ser" />
          <p className="title-bullet">
          <FormattedMessage
            id="bullets.empathy"
            defaultMessage="Empatía"
            />
            </p>
          <p>
          <FormattedMessage
            id="bullets.empathy.slogan"
            defaultMessage="Nos ponemos en el lugar del cliente  y buscamos que su experiencia ¡sea perfecta!"
            />
          </p>
        </div>

    </div>
      </div>

  );
}

export default Bullets;
