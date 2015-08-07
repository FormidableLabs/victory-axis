/*global document:false*/
import React from "react";
import {VictoryAxis} from "../src/index";

class App extends React.Component {
  render() {
    const style = {
      axis: {
        marginTop: 50,
        marginBottom: 50,
        marginLeft: 50,
        marginRight: 50,
        width: 500, // same as the containing svg
        height: 300 // same as the containing svg
      },
      svg: {
        border: "2px solid black",
        width: 500,
        height: 300
      }
    };

    return (
      <div className="demo">
        <div>
          <svg style={style.svg}>
            < VictoryAxis style={style.axis}/>
          </svg>
        </div>
        <div>
          <svg style={style.svg}>
            <VictoryAxis style={style.axis}
              label="X-AXIS"
              orientation="bottom"
              tickValues={[0, 20, 40, 60, 80, 100]}/>
            <VictoryAxis style={style.axis}
              label="Y-AXIS"
              orientation="left"
              tickValues={[0, 20, 40, 60, 80, 100]}/>
          </svg>
        </div>
        <div>
          <svg style={style.svg}>
            <VictoryAxis style={style.axis}
              label="AXIS"
              tickValues={[-40, -20, 0, 20, 40]}/>
          </svg>
        </div>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
