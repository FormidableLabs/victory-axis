/*global document:false*/
/*global window:false */
import React from "react";
import {VictoryAxis} from "../src/index";
import d3 from "d3";
import _ from "lodash";
import Radium from "radium";

@Radium
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tickValues: [5, 10, 25, 31, 42],
      domain: [-5, 5]
    };
  }

  getTickValues() {
    return _.map(_.range(5), (i) => {
      return 10 * i + _.random(5);
    });
  }


  getDomain() {
    const someNumber = _.random(2, 5);
    return [-someNumber, someNumber];
  }

  componentDidMount() {
    window.setInterval(() => {
      this.setState({
        tickValues: this.getTickValues(),
        domain: this.getDomain()
      });
    }, 2000);
  }

  render() {
    const baseStyle = {
      margin: 20,
      width: 700, // same as the containing svg
      height: 400 // same as the containing svg
    };

    const svgStyle = {
      width: 700,
      height: 400
    };

    return (
      <div className="demo">
        <div>
          <h1>Default Axis</h1>
          <VictoryAxis style={baseStyle}
            tickValues={this.state.tickValues}
            tickStyle={{strokeWidth: 3}}
            gridStyle={{strokeWidth: 3}}
            animate={{velocity: 0.01}}
            showGridLines={true}/>
        </div>
        <div>
          <h1>Time Scale Axis</h1>
          <VictoryAxis
            showGridLines={true}
            scale={d3.time.scale()}
            tickValues={[
              new Date(1980, 1, 1),
              new Date(1990, 1, 1),
              new Date(2000, 1, 1),
              new Date(2010, 1, 1),
              new Date(2020, 1, 1)]}
              tickFormat={d3.time.format("%Y")}/>
        </div>
        <div>
        <h1>X-Y Axis</h1>
          <svg style={svgStyle}>
            <VictoryAxis
              domain={this.state.domain}
              showGridLines={true}
              crossAxis={true}
              orientation="bottom"
              offsetX={50}
              offsetY={150}
              containerElement="g"/>
            <VictoryAxis
              domain={this.state.domain.concat().reverse()}
              showGridLines={true}
              crossAxis={true}
              orientation="left"
              offsetX={250}
              offsetY={50}
              containerElement="g"/>
            </svg>
        </div>
        <div>
        <h1>Log Scale Axis</h1>
          <VictoryAxis
            showGridLines={true}
            orientation="left"
            scale={d3.scale.log()}
            domain={[1, 5]}
            offsetX={50}/>
        </div>
        <div>
          <h1>Ordinal Scales</h1>
          <VictoryAxis
            style={baseStyle}
            tickValues={[
              "Mets",
              "Giants",
              "Yankees",
              "Nationals",
              "Mariners"
            ]}/>
        </div>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
