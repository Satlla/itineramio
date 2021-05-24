import React, { useEffect, useState } from "react";
import { fb } from "../firebase";
import "../css/components/addlisting.css";
import { toast } from "react-toastify";
import FreeBreakfastIcon from '@material-ui/icons/FreeBreakfast';



const db = fb.firestore();

function AddListing() {
  const [images, setImages] = useState([]);
  const [listings, setlistings] = useState([]);

  const onFileChange = async (e) => {
    for (let i = 0; i < e.target.files.length; i++) {
      const files = e.target.files[i];
      console.log(files);
      const storageRef = fb.storage().ref();
      const fileRef = storageRef.child(`prueba/${files.name}`);
      await fileRef.put(files);
      setImages(await fileRef.getDownloadURL());

    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  //Desginamos los valores por defecto para el formulario.
  const initialStateValues = {
    listingname: "",
    listingslogan: "",
    listingcategory: "",
    listinglocation: "",
    listingprice: "",
    listingitins: "",
    listingdescription: "",
    listingbest: "",
    listingimage: [],
  };

  const [values, setValues] = useState(initialStateValues);

  const onSubmit = async (e) => {
    e.preventDefault();
    setValues({ ...initialStateValues });
    const listingname = e.target.listingname.value;
    const listingslogan = e.target.listingslogan.value;
    const listingcategory = e.target.listingcategory.value;
    const listinglocation = e.target.listinglocation.value;
    const listingprice = e.target.listingprice.value;
    const listingitins = e.target.listingitins.value;
    const listingdescription = e.target.listingdescription.value;
    const listingbest = e.target.listingbest.value;
    const listingimage = e.target.listingimage.value;

    if (
      !listingname ||
      !images ||
      !listingslogan ||
      !listingcategory ||
      !listinglocation ||
      !listingprice ||
      !listingitins ||
      !listingdescription ||
      !listingbest ||
      !listingimage
    ) {
      return;
    }
    await db.collection("listings").doc().set({
      name: listingname,
      image: images,
      slogan: listingslogan,
      category: listingcategory,
      location: listinglocation,
      price: listingprice,
      itins: listingitins,
      description: listingdescription,
      best: listingbest,
    });
    toast("Se ha añadido el anuncio correctamente", {
      type: "success",
      autoClose: 1000,
    });
  };

  useEffect(() => {
    const fetchlistings = async () => {
      const listingsCollection = await db.collection("listings").get();

      setlistings(
        listingsCollection.docs.map((doc) => {
          return doc.data();
        })
      );
    };
    fetchlistings();
  }, []);

  return (
    <div className="Main-Layout">
      <div className="form-container">

      <div className="control-panel">
        <div className="form-listing">

          <form className=" form-card" onSubmit={onSubmit}>
      <h3> Subir un itineramio</h3>
            <div className="row mt-4">
              <div className="col">
                <label className="labels__listing" for="name">
                  {" "}
                  Nombre del Lugar{" "}
                </label>
                <input
                  type="text "
                  className="form-control"
                  name="listingname"
                  placeholder="Nombre del lugar"
                  onChange={handleInputChange}
                  value={values.listingname}
                />
              </div>
              {/* Agregando categorias */}


              {/* Fin de las Categorias */}
            </div>

            {/* Agregando precio medio */}
            <div className="prices-group">
              <div className=" mt-4">
                <label className="labels__listing" for="price">
                  {" "}
                  Precio Medio por pax{" "}
                </label>
                <input
                  type="number "
                  className="form-control"
                  placeholder="Precio medio"
                  name="listingprice"
                  onChange={handleInputChange}
                  value={values.listingprice}
                />
              </div>

              {/* Agregando Itins */}
              <div className=" mt-4">
                <label className="labels__listing" for="itins">
                  {" "}
                  Puntuación Lugar{" "}
                </label>
                <input
                  type="number "
                  className="form-control"
                  placeholder="Puntuación itins"
                  name="listingitins"
                  onChange={handleInputChange}
                  value={values.listingitins}
                />
              </div>
              <div className="mt-4 ">
                <label for="description" className="labels__listing">
                  {" "}
                  Categoría{" "}
                </label>

                <select
                  className="form-control form-control-md "
                  name="listingcategory"
                >
                  <option> Desayunar</option>
                  <option>Tapas & Vinos</option>
                  <option>Arrocerías</option>
                  <option>Top</option>
                  <option>Coffee & Relax</option>
                </select>
              </div>
            </div>

            <div className=" row mt-4">
            <div className=" col">
              <label className="labels__listing" for="slogan">
                {" "}
                Slogan del Lugar{" "}
              </label>
              <input
                type="text "
                className="form-control"
                placeholder="Some Url"
                name="listingslogan"
                placeholder="Slogan del listing"
                onChange={handleInputChange}
                value={values.listingslogan}
              />
            </div>
            </div>

            {/* Agregando location */}
            <div className="row mt-4">
            <div className="col">
              <label className="labels__listing" for="location">
                {" "}
                Dirección{" "}
              </label>
              <input
                type="text "
                className="form-control"
                placeholder="Dirección"
                name="listinglocation"
                onChange={handleInputChange}
                value={values.listinglocation}
              />
              </div>
            </div>

            <div className="row mt-4">
            <div className="col">
              <label className="labels__listing" for="description">
                {" "}
                Describe el emplazamiento{" "}
              </label>
              <textarea
                className="form-control"
                placeholder="Describe el lugar brevemente"
                name="listingdescription"
                rows="3"
                onChange={handleInputChange}
                value={values.listingdescription}
              />
            </div>
            </div>

            <div className="row mt-4">
            <div className="col">
              <label className="labels__listing" for="listingbest">
                {" "}
                Lo mejor del lugar{" "}
              </label>
              <textarea
                className="form-control"
                placeholder="¿Qué es lo mejor del lugar?"
                name="listingbest"
                rows="3"
                onChange={handleInputChange}
                value={values.listingbest}
              />
            </div>
            </div>

            <input
            className="mt-4"
              type="file"
              id="subirfoto"
              multiple
              onChange={onFileChange}
              name="listingimage"
            />
            <button className="btn btn-primary btn-block mt-4">
              {" "}
              Enviar Listing{" "}
            </button>
          </form>
          
        </div>
      </div>
    </div>
    </div>
  );
}

export default AddListing;
