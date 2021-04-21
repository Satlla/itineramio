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

          <Route exact path="/apartments/enriquetaloft/faq">
            <EnriquetaLoft />
          </Route>

          <Route exact path="/apartments/enriquetaloft/faq/checkin">
            <Checkin />
          </Route>

          <Route exact path="/apartments/enriquetaloft/faq/vitro">
            <Vitro />
          </Route>




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
