import React, { useEffect, useState } from "react";
import { fb } from "../firebase";
import Header from "../components/Header";
import "../css/components/newlisting.css";
import ListingsTable from "./ListingsTable";
import { toast } from "react-toastify";
// import HighlightOffIcon from "@material-ui/icons/HighlightOff";

const db = fb.firestore();

function ListingForm() {
  const [fileUrl, setFileUrl] = React.useState(null);
  const [listings, setlistings] = React.useState([]);
  // const [tags, setTags] = React.useState(["Romantic", "Couples", "Aniversary"]);

  // const addTags = event => {
	// 	if (event.target.value !== "") {
	// 		setTags([...tags, event.target.value]);

	// 		event.target.value = "";
	// 	}
	// };
  // const removeTags = indexToRemove => {
	// 	setTags([...tags.filter((_, index) => index !== indexToRemove)]);
	// };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    const storageRef = fb.storage().ref();
    const fileRef = storageRef.child(file.name);
    await fileRef.put(file);
    setFileUrl(await fileRef.getDownloadURL());
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
    listingimage: ""

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
    const listingimage = e.target.listingimage.value;

    if (
      !listingname ||
      !fileUrl ||
      !listingslogan ||
      !listingcategory ||
      !listinglocation ||
      !listingprice ||
      !listingitins ||
      !listingdescription||
      !listingimage

    ) {
      return;
    }
    await db.collection("listings").doc().set({
      name: listingname,
      image: fileUrl,
      slogan: listingslogan,
      category: listingcategory,
      location: listinglocation,
      price: listingprice,
      itins: listingitins,
      description: listingdescription,
      image: listingimage

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
    <div className="form-container">
      <div className="control-panel">
        <Header />
        <div className="form-listing">
          <h3> Añadir listing </h3>

          <form className=" card card-body" onSubmit={onSubmit}>
            <div className="row">
              <div className="col">
                <label className="labels__listing" for="name">
                  {" "}
                  Nombre del Listing{" "}
                </label>
                <input
                  type="text "
                  className="form-control"
                  placeholder="Some Url"
                  name="listingname"
                  placeholder="Nombre del listing"
                  onChange={handleInputChange}
                  value={values.listingname}
                />
              </div>
              {/* Agregando categorias */}
              <div className="col ">
                <label for="description" className="labels__listing" >
                  {" "}
                  Categoría del Listing{" "}
                </label>

                <select
                  className="form-control form-control-md mb-4"
                  name="listingcategory"
                >
                  <option>Desayunar</option>
                  <option>Tapas & Vinos</option>
                  <option>Arrocerías</option>
                  <option>Top</option>
                  <option>Coffee & Relax</option>
                </select>
              </div>

              {/* Fin de las Categorias */}
            </div>
            {/* Agregando precio medio */}
            <div className="row">
              <div className="col mb-3">
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
              <div className="col">
                <label className="labels__listing" for="itins">
                  {" "}
                  Puntuación Itineramio{" "}
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
            </div>
            <div className="row">
              <label className="labels__listing" for="slogan">
                {" "}
                Slogan del Listing{" "}
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

            {/* Agregando location */}
            <div className="row">
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

            <div className="row">
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

            {/* Agregando Tags */}
            {/* <div className="tags-input">
              <ul>
                {tags.map((tag, index) => (
                  <li key={index}>
                    <span className="tag">
                      {tag}
                      <i className="icon__close" onClick={ () => removeTags(index)}>
                        <HighlightOffIcon />
                      </i>
                    </span>
                  </li>
                ))}
              </ul>
              <input
                type="text"
                onKeyUp={event => event.key === "Enter" ? addTags(event) : null}
                placeholder="Press enter to add tags"
                name="listingtags"
                onChange={handleInputChange}
                value={values.listingtags}
			/>
            </div> */}

            <input 
            type="file"
             id="subirfoto"
            onChange={onFileChange}
            name="listingimage"
              />
            <button className="btn btn-primary btn-block mt-4">
              {" "}
              Enviar Listing{" "}
            </button>
          </form>
          <ListingsTable />
        </div>
      </div>
    </div>
  );
}

export default ListingForm;
