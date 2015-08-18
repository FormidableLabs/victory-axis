/*global document:false*/
import React from "react";
import {VictoryAxis} from "../src/index";
import d3 from "d3";

class App extends React.Component {
  render() {
    const style = {
      axis: {
        margin: 20,
        width: 700, // same as the containing svg
        height: 400 // same as the containing svg
      },
      svg: {
        width: 700,
        height: 400
      }
    };

    return (
      <div className="demo">
        <div>
          <h1>Default Axis</h1>
          <svg style={style.svg}>
            <VictoryAxis style={style.axis}/>
          </svg>
        </div>
        <div>
          <h1>Time Scale Axis</h1>
          <svg style={style.svg}>
            <VictoryAxis
              style={style.axis}
              scale={() => d3.time.scale()}
              tickValues={[
                new Date(1980, 1, 1),
                new Date(1990, 1, 1),
                new Date(2000, 1, 1),
                new Date(2010, 1, 1),
                new Date(2020, 1, 1)]}
                tickFormat={() => d3.time.format("%Y")}/>
          </svg>
        </div>
        <div>
          <h1>X-Y Axis</h1>
          <svg style={style.svg}>
            <VictoryAxis
              label="x-axis"
              orientation="bottom"
              offsetX={50}
              offsetY={50}/>
            <VictoryAxis
              label="y-axis"
              orientation="left"
              offsetX={50}
              offsetY={50}/>
          </svg>
        </div>
        <div>
        <h1>Log Scale Axis</h1>
          <svg style={style.svg}>
            <VictoryAxis style={style.axis}
              orientation="left"
              scale={() => d3.scale.log()}
              offsetX={75}
              domain={[1, 5]}/>
          </svg>
        </div>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
