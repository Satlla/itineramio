import React from 'react'
import { Link } from "react-router-dom";
import "../css/pages/plans.css";
import romantic from '../assets/pages/romantic.svg';
import museums from '../assets/pages/museum.svg';
import drinks from '../assets/pages/drinks.svg';
import traditional from '../assets/pages/traditional.svg';
import gourmet from '../assets/pages/gourmet.svg';
import aniversary from '../assets/pages/aniversary.svg';
import family from '../assets/pages/family.svg';
import group from '../assets/pages/group.svg';
import plans from '../assets/pages/plans/plans-group.png';


function Categories() {
  return (
    <div>




    <div className="nav__plans">
      <div className="plan">
        <img className="plan__categoryImage" src={romantic} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Romantic</span>
        <span> Parejas</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={family} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Con niños</span>
        <span> Familias</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={drinks} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Bebidas</span>
        <span> Vinos y Copas</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={museums} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Monumentos</span>
        <span> Arte</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={traditional} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Tradicional</span>
        <span> De la Zona</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={aniversary} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Aniversario</span>
        <span> Parejas</span>
       </div>

      </div>

      <div className="plan">
        <img className="plan__categoryImage" src={gourmet} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Gourmet</span>
        <span> Gastronomía</span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={group} alt=""/>
        <div className="plan__content">
        <span className="plan__title">Grupos</span>
        <span> Amigos</span>
       </div>

      </div>

    </div>

  </div>
);
}

export default Categories
