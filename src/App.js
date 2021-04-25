import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Dashboard from "./pages/Dashboard";
import UserListings from "./components/UserListings";
import ListingDetails from './pages/ListingDetails';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Hiw from './pages/Hiw';
import Footer from "./components/Footer";
import Explore from './pages/Explore';
import Plans from './pages/Plans';
import Colaborate from './pages/Colaborate';
import Estandares from './pages/Estandares';
import Privacity from './pages/Privacity'
import Suggestions from './components/UserDashboard/Suggestions';
import EnriquetaLoft from './components/Apartments/EnriquetaLoft/Enriquetaloft';
import Checkin from './components/Apartments/EnriquetaLoft/components/Checkin';
import Vitro from './components/Apartments/EnriquetaLoft/components/Vitro';
import Jacuzzi from './components/Apartments/EnriquetaLoft/components/Jacuzzi';
import Phones from './components/Apartments/EnriquetaLoft/components/Telefonos';
import Washingmachine from './components/Apartments/EnriquetaLoft/components/Washingmachine';
import Wifi from './components/Apartments/EnriquetaLoft/components/Wifi';
import Checkout from "./components/Apartments/EnriquetaLoft/components/Checkout";
import Enriqueta4 from "./components/Apartments/Enriqueta4/Enriqueta4";
import Checkine4 from "./components/Apartments/Enriqueta4/components/Checkine4";
import Checkoute4 from "./components/Apartments/Enriqueta4/components/Checkoute4";
import Washingmachinee4 from "./components/Apartments/Enriqueta4/components/Washingmachinee4";
import Vitroe4 from "./components/Apartments/Enriqueta4/components/Vitroe4";
import Phonese4 from "./components/Apartments/Enriqueta4/components/Phonese4";
import Wifie4 from "./components/Apartments/Enriqueta4/components/Wifie4";






function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>

          <Route exact path="/como-funciona">
            <Hiw />
          </Route>

          <Route exact path="/listing/:listingId">
            <ListingDetails />

          </Route>

          <Route exact path="/dashboard">
            <Dashboard />
          </Route>

          <Route exact path="/dashboard/userlistings">
            <UserListings />
          </Route>

          <Route exact path="/dashboard/suggestions">
            <Suggestions />
          </Route>
        {/*  ENRIQUETA LOFT */}
          <Route exact path="/apartments/enriquetaloft/faq">
            <EnriquetaLoft />
          </Route>

          <Route exact path="/apartments/enriquetaloft/faq/checkin">
            <Checkin />
          </Route>

          <Route exact path="/apartments/enriquetaloft/faq/vitro">
            <Vitro />
          </Route>

          <Route exact path="/apartments/enriquetaloft/faq/phones">
            <Phones />
          </Route>
          <Route exact path="/apartments/enriquetaloft/faq/washingmachine">
            <Washingmachine />
          </Route>
          
          <Route exact path="/apartments/enriquetaloft/faq/wifi">
            <Wifi />
          </Route>
          <Route exact path="/apartments/enriquetaloft/faq/jacuzzi">
            <Jacuzzi />
          </Route>

          <Route exact path="/apartments/enriquetaloft/faq/checkout">
            <Checkout />
          </Route>
        {/*  FIN ENRIQUETA LOFT */}

        {/*  ENRIQUETA 4 */}
        <Route exact path="/apartments/enriqueta4/faq">
            <Enriqueta4 />
          </Route>
          <Route exact path="/apartments/enriqueta4/faq/checkine4">
            <Checkine4 />
          </Route>
          <Route exact path="/apartments/enriqueta4/faq/vitroe4">
            <Vitroe4 />
          </Route>
          <Route exact path="/apartments/enriqueta4/faq/checkoute4">
            <Checkoute4 />
          </Route>
          <Route exact path="/apartments/enriqueta4/faq/phonese4">
            <Phonese4 />
          </Route>
          <Route exact path="/apartments/enriqueta4/faq/washingmachinee4">
            <Washingmachinee4 />
          </Route>
          <Route exact path="/apartments/enriqueta4/faq/wifie4">
            <Wifie4 />
          </Route>

        {/*FIN ENRIQUETA 4 */}



          <Route path="/explore">
            <Explore />
          </Route>

          <Route path="/privacity">
            <Privacity />
          </Route>

          <Route path="/plans">
            <Plans />
          </Route>
          <Route  exact path="/colaborate">
             <Colaborate/>
          </Route>

          <Route  exact path="/estandares">
             <Estandares/>
          </Route>



        </Switch>{" "}

        <Footer />

      </Router>{" "}
      <ToastContainer />
    </div>
  );
}

export default App;
