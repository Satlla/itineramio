import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Home from "./components/Home";
import NewListing from "./components/NewListing";
import ListingDetails from './pages/ListingDetails';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LinkForm from "./components/LinkForm";
import Footer from "./components/Footer";



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



          <Route exact path="/listing/:listingId">
            <ListingDetails />

          </Route>

          <Route path="/new-listing">
            <NewListing />
          </Route>

          <Route path="/link-form">
            <LinkForm />
          </Route>

        </Switch>{" "}

        <Footer />

      </Router>{" "}
      <ToastContainer />
    </div>
  );
}

export default App;
