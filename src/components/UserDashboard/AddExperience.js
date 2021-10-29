import React, { useEffect, useState } from "react";
import { fb } from "../../firebase";
import "../../css/components/addlisting.css";
import { toast } from "react-toastify";



const db = fb.firestore();

function Addexperience() {
  const [images, setImages] = useState([]);
  const [experiences, setExperiences] = useState([]);

  const onFileChange = async (e) => {
    for (let i = 0; i < e.target.files.length; i++) {
      const files = e.target.files[i];
      console.log(files);
      const storageRef = fb.storage().ref();
      const fileRef = storageRef.child(`images/${files.name}`);
      await fileRef.put(files);
      setImages(await fileRef.getDownloadURL());

    } 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  //Designamos los valores por defecto para el formulario.
  const initialStateValues = {
    experiencename: "",
    experienceslogan: "",
    experiencecategory: "",
    experiencelocation: "",
    experiencestar:"",
    experiencephone: "",
    experienceprice: "",
    experienceduration: "",
    experiencedescription: "",
    experiencebest: "",
    experienceimage: [],
  };

  const [values, setValues] = useState(initialStateValues);

  const onSubmit = async (e) => {
    e.preventDefault();
    setValues({ ...initialStateValues });
    const experiencename = e.target.experiencename.value;
    const experienceslogan = e.target.experienceslogan.value;
    const experiencecategory = e.target.experiencecategory.value;
    const experiencestar = e.target.experiencestar.value;
    const experiencelocation = e.target.experiencelocation.value;
    const experienceprice = e.target.experienceprice.value;
    const experienceduration = e.target.experienceduration.value;
    const experiencedescription = e.target.experiencedescription.value;
    const experiencebest = e.target.experiencebest.value;
    const experienceimage = e.target.experienceimage.value;

    if (
      !experiencename ||
      !images ||
      !experienceslogan ||
      !experiencecategory ||
      !experiencelocation ||
      !experiencestar ||
      !experienceprice ||
      !experienceduration ||
      !experiencedescription ||
      !experiencebest ||
      !experienceimage
    ) {
      return;
    }
    await db.collection("experiences").doc().set({
      name: experiencename,
      image: images,
      slogan: experienceslogan,
      category: experiencecategory,
      location: experiencelocation,
      productstar: experiencestar,
      price: experienceprice,
      duration: experienceduration,
      description: experiencedescription,
      best: experiencebest,
    });
    toast("Se ha añadido tu experiencia correctamente", {
      type: "success",
      autoClose: 1000,
    });
  };

  useEffect(() => {
    const fetchexperiences = async () => {
      const experiencesCollection = await db.collection("experiences").get();

      setExperiences(
        experiencesCollection.docs.map((doc) => {
          return doc.data();
        })
      );
    };
    fetchexperiences();
  }, []);

  return (
    <div className="Main-Layout">
      <div className="form-container">

      <div className="control-panel">
        <div className="form-experience">

          <form className=" form-card" onSubmit={onSubmit}>
      <h3> Subir una experiencia</h3>
            <div className="row mt-4">
              <div className="col">
                <label className="labels__experience" for="name">
                  {" "}
                  Título de la experiencia{" "}
                </label>
                <input
                  type="text "
                  className="form-control"
                  name="experiencename"
                  placeholder="Título de la experiencia"
                  onChange={handleInputChange}
                  value={values.experiencename}
                />
              </div>

              <div className="col">
                <label className="labels__experience" for="name">
                  {" "}
                  Lo mejor de la experiencia{" "}
                </label>
                <input
                  type="text "
                  className="form-control"
                  name="experiencestar"
                  placeholder="¿Qué es lo que mas les va a gustar a tus clientes?"
                  onChange={handleInputChange}
                  value={values.experiencestar}
                />
              </div>


              {/* <div className="col">
                <label className="labels__experience" for="name">
                  {" "}
                  Telefono{" "}
                </label>
                <input
                  type="tel "
                  className="form-control"
                  name="experiencephone"
                  placeholder="Telefono del Establecimiento"
                  onChange={handleInputChange}
                  value={values.experiencephone}
                />
              </div> */}
              {/* Agregando categorias */}


              {/* Fin de las Categorias */}
            </div>

            {/* Agregando precio medio */}
            <div className="prices-group">
              <div className=" mt-4">
                <label className="labels__experience" for="price">
                  {" "}
                  Precio Medio por pax{" "}
                </label>
                <input
                  type="number "
                  className="form-control"
                  placeholder="Precio por persona"
                  name="experienceprice"
                  onChange={handleInputChange}
                  value={values.experienceprice}
                />
              </div>


              <div className=" mt-4">
                <label className="labels__experience" for="itins">
                  {" "}
                  Duración en horas{" "}
                </label>
                <input
                  type="number "
                  className="form-control"
                  placeholder=" Duración total en horas "
                  name="experienceduration"
                  onChange={handleInputChange}
                  value={values.experienceduration}
                />
              </div>
              <div className="mt-4 ">
                <label for="description" className="labels__experience">
                  {" "}
                  Categoría{" "}
                </label>

                <select
                  className="form-control form-control-md "
                  name="experiencecategory"
                >
                  <option> Aventura</option>
                  <option>Gastronómica</option>
                  <option>Música</option>
                  <option>Turística</option>
                  <option>Coffee & Relax</option>
                  <option>Copas</option>
                  <option>A la carta</option>
                  <option>Gastrobar</option>
                </select>
              </div>
            </div>

            <div className=" row mt-4">
            <div className=" col">
              <label className="labels__experience" for="slogan">
                {" "}
                Slogan del Lugar{" "}
              </label>
              <input
                type="text "
                className="form-control"
                placeholder="Some Url"
                name="experienceslogan"
                placeholder="Slogan del experience"
                onChange={handleInputChange}
                value={values.experienceslogan}
              />
            </div>
            </div>

            {/* Agregando location */}
            <div className="row mt-4">
            <div className="col">
              <label className="labels__experience" for="location">
                {" "}
                Dirección{" "}
              </label>
              <input
                type="text "
                className="form-control"
                placeholder="Dirección exacta del punto de partida"
                name="experiencelocation"
                onChange={handleInputChange}
                value={values.experiencelocation}
              />
              </div>
            </div>

            <div className="row mt-4">
            <div className="col">
              <label className="labels__experience" for="description">
                {" "}
                ¿Qué haréis durante la experiencia? {" "}
              </label>
              <textarea
                className="form-control"
                placeholder="Describe brevemente que haréis"
                name="experiencedescription"
                rows="3"
                onChange={handleInputChange}
                value={values.experiencedescription}
              />
            </div>
            </div>

            <div className="row mt-4">
            <div className="col">
              <label className="labels__experience" for="experiencebest">
                {" "}
                Lo mejor de la actividad{" "}
              </label>
              <textarea
                className="form-control"
                placeholder="¿Qué es lo mejor de la experiencia?"
                name="experiencebest"
                rows="3"
                onChange={handleInputChange}
                value={values.experiencebest}
              />
            </div>
            </div>

            <input
            className="mt-4"
              type="file"
              id="subirfoto"
              multiple
              onChange={onFileChange}
              name="experienceimage"
            />
            <button className="btn btn-primary btn-block mt-4">
              {" "}
              Enviar experiencia{" "}
            </button>
          </form>

        </div>
      </div>
    </div>
    </div>
  );
}

export default Addexperience;
