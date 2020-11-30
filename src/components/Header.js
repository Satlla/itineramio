import React from 'react';
import { Link } from 'react-router-dom';
import '../css/components/header.css'
import logo  from '../logo.png';


function Header() {
  return (

    <div>
<nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
<Link className="navbar-brand" to="/">
    <img className="logo" src={ logo } alt=""/>
  </Link>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
    <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
      <li className="nav-item active ml-2 ">
      </li>

    </ul>
    <div className="form-inline my-2 my-lg-0">
    <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
      <li className="nav-item active ml-2 ">
      <a className="nav-link" href="#">¿Cómo funciona? <span class="sr-only">(current)</span></a>
      </li>
      <li className="nav-item active ml-2 ">
      <a class="nav-link" href="#">Iniciar Sesión</a>
      </li>
      <li className="nav-item active ml-2 ">
      <a class="nav-link" href="#">Registrarme</a>
      </li>

    </ul>
    </div>
  </div>
</nav>
    </div>
  )
}

export default Header


