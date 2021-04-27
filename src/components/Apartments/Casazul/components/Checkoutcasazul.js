import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import '../../styles.css';
import { Link } from "react-router-dom";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';


export default function Checkoutcasazul() {
  window.scrollTo(0, 0);
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true,
    checkedF: true,
    checkedG: true,
  });




  
  return (
    <div>

      <div className="cabecera">
        <Link className="header__whyus" to="/apartments/casazul/faq">
          <ChevronLeftIcon/> volver
        </Link>
      </div>

    <div className="checkout__layout">
<div className="checkout__container">

<h6> Revisa los siguientes checks antes de abandonar el apartamento. ¡Puedes tacharlos a medida que vas terminandolos!</h6>
<hr/>
      <FormGroup column>

      <FormControlLabel
        control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} name="checkedH" />}
        label="Ventanas Cerradas"

      />
      <FormControlLabel
        control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} name="checkedH" />}
        label="Grifos Cerrados"
      />
      <FormControlLabel
        control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} name="checkedH" />}
        label="Luces (OFF)"
      />
      <FormControlLabel
        control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} name="checkedH" />}
        label="Televisión (OFF)"
      />
      <FormControlLabel
        control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} name="checkedH" />}
        label="Aire Acondicionado (OFF)"
      />
        <FormControlLabel
        control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} name="checkedH" />}
        label="Llave en Candado"
      />
         <FormControlLabel
        control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} name="checkedH" />}
        label="Mensaje al Anfitrión"
      />

    </FormGroup>

</div>

    </div>
    </div>
  );
}

