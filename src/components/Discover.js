import React from "react";
import "../css/components/discover.css";
import foto1 from "../assets/img/cafe.jpg";
import foto2 from "../assets/img/cafe2.jpg";
import foto3 from "../assets/img/restaurant.jpg";
import foto4 from "../assets/img/restaurant2.jpg";

function Discover() {
  return (
    <div className="main-cont">
      <div className="container-hero">
        <div className="container-titles">

        <div className="explorer-hero">
          <h3 className="hero-subtitle">
            {" "}
            Los mejores restaurantes de Alicante te están esperando
          </h3>
          <p className="hero-slogan">
            {" "}
            Lugares con encanto, sitios increíbles y experiencias únicas.
          </p>
        </div>
        <div className="explore-itineramio">
          <button className="btn-rounded"> Explorar Lugares</button>
        </div>
        </div>
        <div className="grid-container">
          <div className="item1">
            <img src={foto1} className="hero-img" alt="cafe" />
          </div>
          <div className="item2">
            <img src={foto2} className="hero-img" alt="cafe" />
          </div>
          <div className="item3">
            <img src={foto3} className="hero-img" alt="cafe" />
          </div>
          <div className="item4">
            <img src={foto4} className="hero-img" alt="cafe" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Discover;
