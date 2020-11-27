import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Home from "./components/Home";
import Listings from "./components/Listings";
import NewListing from "./components/NewListing";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function App() {
  return (
    <div>

      <Router>
        <Header />

        <Switch>
          <Route exact path="/">
            <Home />
          </Route>

          <Route path="/listings">
            <Listings title="Popular" />

          </Route>

          <Route path="/new-listing">
            <NewListing />
          </Route>

        </Switch>
      </Router>
      <ToastContainer/>
    </div>
  );
}

export default App;
