import React from 'react'
import '../css/components/informationcard.css';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

export default function InformationListing() {
  return (

    <div className="container__information p-2">

    <div className="information-card">
      <ErrorOutlineIcon />

<div className="descriptions m-2">

      <h4 className="information-title"> Recomendaciones para tus anuncios</h4>
      <p className="information-description"> Los restaurantes deben cumplir con nuestros estándares de calidad. Por favor no subas lugares que no sean absolutamente memorables! Revisa las políticas  y estándares de calidad de itineramio</p>
</div>
    </div>

    </div>
  )
}
