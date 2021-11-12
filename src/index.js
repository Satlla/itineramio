import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import  { LangProvider } from './context/langContext';
import './index.css';
import '../src/fonts/Circular-Black.otf'
import '../src/fonts/Circular-Bold.otf'
import '../src/fonts/Circular-Medium.otf'
import '../src/fonts/Circular-Book.otf'

ReactDOM.render(
  <React.StrictMode>
    <LangProvider>

    <App />


    </LangProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
