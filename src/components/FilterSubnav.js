import React from 'react'
import  "../css/components/filters.css"


function FilterSubnav() {
  return (
    <div className="subnav">


      <div className="dropdown">
    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      Popular
    </button>
    <div className="dropdown-menu"  aria-labelledby="dropdownMenu2">
      <button className="dropdown-item" type="button" >Desayunar</button>
      <button className="dropdown-item" type="button">Arrocerías</button>
      <button className="dropdown-item" type="button"> Tapas & Vinos</button>
      <button className="dropdown-item" type="button">Top</button>
      <button className="dropdown-item" type="button">Coffee & Relax</button>
    </div>
  </div>
  <div className="nav-list">
  <ul className="nav">
  <li className="nav-item">
    <a className="nav-link active"  href="#">Planes</a>
  </li>
  <li className="nav-item">
    <a className="nav-link" href="#">Homes</a>
  </li>
  <li className="nav-item">
    <a className="nav-link" href="#">Visitar</a>
  </li>

</ul>
  </div>

 

    </div>

  )
}

export default FilterSubnav
