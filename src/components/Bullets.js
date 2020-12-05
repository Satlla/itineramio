import React from "react";
import "../css/components/bullets.css";
import img1 from "../assets/viñetas/1.jpg";
import img2 from "../assets/viñetas/2.jpg";
import img3 from "../assets/viñetas/3.jpg";
function Bullets() {
  return (
    <div className="container-bullets">

       <h3 className="title-container">¿Por qué Itineramio?</h3>
       
    <div className="bullet-group">
        <div className="list-group-bullet">
          <img src={img1} className="image-bullet" alt="razon-de-ser" />
          <p className="title-bullet">Calidad</p>
          <p>
            Valoramos los lugares que visitanos personalmente, de acuerdo con nuestros estándares de calidad
          </p>
        </div>
        <div className="list-group-bullet">
          <img src={img2} className="image-bullet" alt="razon-de-ser" />
          <p className="title-bullet">Objetividad</p>
          <p>
            No estamos influenciados por marcas o empresas por lo que prima la transparencia y objetividad
          </p>
        </div>
        <div className="list-group-bullet">
          <img src={img3} className="image-bullet" alt="razon-de-ser" />
          <p className="title-bullet">Empatía</p>
          <p>
            Nos ponemos en el lugar del cliente  y buscamos que su experiencia ¡sea perfecta!
          </p>
        </div>

    </div>
      </div>

  );
}

export default Bullets;
