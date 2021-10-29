
import { BrowserRouter as Router, Switch, Route, BrowserRouter, Link } from "react-router-dom";
import AddListing from "../components/UserDashboard/AddListing";
import HeaderTransparent from "../components/HeaderTransparent";
import '../css/components/dashboard.css'
import DearHost from "../components/UserDashboard/DearHost";
import AddExperience from "../components/UserDashboard/AddExperience"
import UserListings from "../components/UserDashboard/UserListings"
import Suggestions from "../components/UserDashboard/Suggestions";

function Dashboard() {
  return (
    <div>

<HeaderTransparent/>

    <BrowserRouter>
      <div>

        <DearHost />
        <section>

<div className="main-panel">
  <div className="grid-panel">

    <button className="linkpanel">

      <Link to="/dashboard">
      <a href className="dashboard__link  "> Nuevo Listing</a>
    </Link>

    </button>

    <button className="linkpanel">
    <Link to="/addexperience">
      <a href className="dashboard__link  "> Nueva Experiencia</a>
    </Link>

    </button>

    <button className="linkpanel">
      <Link to="/userlistings">
      <a href className="dashboard__link"> Publicados</a>
    </Link>

    </button>

    <button className="linkpanel">

      <Link to="/suggestions">
      <a href className="dashboard__link ml-4"> Sugerencias</a>
    </Link>

    </button>

  </div>
</div>
</section>

  {/* Fin del NavDashboard */}

    </div>

  {/* Inicio de las rutas */}

    <Route path="/dashboard">
      <AddListing/>
    </Route>

    <Route exact path="/addexperience">
      <AddExperience/>
    </Route>

    <Route exact path="/userlistings">
      <UserListings/>
    </Route>

    <Route exact path="/suggestions">
      <Suggestions/>
    </Route>

  {/* Fin de las Rutas */}


  {/* Fin de las Rutas */}
    </BrowserRouter>
     </div>

  );
}

export default Dashboard;

