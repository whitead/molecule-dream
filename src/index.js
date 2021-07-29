import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./styles.less";
import "regenerator-runtime/runtime";
import "core-js/stable"; // or more selective import, like "core-js/es/array"



var mountNode = document.getElementById("app");
ReactDOM.render(<App cardCount="24" />, mountNode);