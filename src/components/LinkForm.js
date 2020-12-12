import React, { useState } from "react";
import storage from "../firebase";
import Links from './Links';

// Importando las imagenes

function LinkForm(props) {
  //Función para grabar todo lo que tipeas en el input

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    console.log(name, value);
  };

  //Creamos una constante con los valores iniciales

  const initialStateValues = {
    url: "",
    name: "",
    description: "",
  };

  // utilizamos en Hook de react UseState para recibir valores y enviar valores.

  const [values, setValues] = useState(initialStateValues);

  const handleSubmit = (e) => {
    e.preventDefault();
    props.addOrEditLink(values);
    setValues({ ...initialStateValues });
  };

  return (
    <div>
      <h3> Add a new listing for itineramio </h3>
      <form className=" card card-body" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text "
            className="form-control"
            placeholder="Some Url"
            name="url"
            onChange={handleInputChange}
            value={values.url}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Some title"
            name="name"
            onChange={handleInputChange}
            value={values.name}
          />
        </div>
        <div className="form-group">
          <textarea
            className="form-control"
            name="description"
            id=""
            cols="30"
            rows="3"
            placeholder="Escribe una descripcion"
            onChange={handleInputChange}
            value={values.description}
          ></textarea>
        </div>
        <div className="form-group">
          <input type="file" />
          <button> Subir </button>
        </div>

        <button className="btn btn-primary btn-block"> Enviar</button>
      </form>
        <Links />
    </div>
  );
}

export default LinkForm;
