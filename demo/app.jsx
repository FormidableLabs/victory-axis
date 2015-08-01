/*global document:false*/
import React from "react";
import {VictoryAxis} from "../src/index";

class App extends React.Component {
  render() {
    return (
      <div className="demo">
        < VictoryAxis/>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
