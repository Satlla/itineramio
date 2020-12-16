import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import NewListing from "./components/NewListing";
import ListingDetails from './pages/ListingDetails';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LinkForm from "./components/LinkForm";
import AboutUs from './pages/AboutUs';
import Footer from "./components/Footer";
import Explore from './pages/Explore';



function App() {
  return (
    <div>
      <Router>
       

        <Switch>
          <Route exact path="/">
            <Home />
          </Route>

          <Route exact path="/linkform">
            <LinkForm />
          </Route>

          <Route exact path="/about-us">
            <AboutUs />
          </Route>

          <Route exact path="/listing/:listingId">
            <ListingDetails />

          </Route>

          <Route path="/new-listing">
            <NewListing />
          </Route>

          <Route path="/link-form">
            <LinkForm />
          </Route>

          <Route path="/explore">
            <Explore />
          </Route>

        </Switch>{" "}

        <Footer />

      </Router>{" "}
      <ToastContainer />
    </div>
  );
}

export default App;
