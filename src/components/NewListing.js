import React, { useEffect, useState } from "react";
import { fb } from "../firebase";
import Header from '../components/Header';
import "../css/components/newlisting.css";
import ListingsTable from "./ListingsTable";
import { toast } from "react-toastify";

const db = fb.firestore();

function ListingForm() {
  const [fileUrl, setFileUrl] = React.useState(null);
  const [listings, setlistings] = React.useState([]);

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
    console.log(name, value);
  };

//Desginamos los valores por defecto para el formulario.
  const initialStateValues = {
    listingname: "",
    listingslogan: "",
    listingcategory: "",
  };

  const [values, setValues] = useState(initialStateValues);

  const onSubmit = async (e) => {
    e.preventDefault();
    setValues({ ...initialStateValues });
    const listingname = e.target.listingname.value;
    const listingslogan = e.target.listingslogan.value;
    const listingcategory = e.target.listingcategory.value;
    if (!listingname || !fileUrl || !listingslogan || !listingcategory) {
      return;
    }
    await db.collection("listings").doc().set({
      name: listingname,
      image: fileUrl,
      slogan: listingslogan,
      category: listingcategory,
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
    <div className="col-lg-6">
      < Header />
      <h3> Añadir listing </h3>

      <form className=" card card-body" onSubmit={onSubmit}>
        <div className="form-group">
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
        <div className="form-group">
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
        {/* Agregando categorias */}

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

        {/* Fin de las Categorias */}

        <input type="file" id="subirfoto" onChange={onFileChange} />
        <button className="btn btn-primary btn-block mt-4">
          {" "}
          Enviar Listing{" "}
        </button>
      </form>
      <ListingsTable />
    </div>
  );
}

export default ListingForm;
