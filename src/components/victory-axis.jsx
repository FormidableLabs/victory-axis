import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

@Radium
class VictoryAxis extends React.Component {

  constructor(props) {
    super(props);
    const style = this.getStyles();
    this.state = {
      x: this.props.x,
      y: this.props.y
    };
    this.state.y.range = {
      min: style.margin,
      max: style.height - style.margin
    };
    this.state.x.range = {
      min: style.margin,
      max: style.width - style.margin
    };

    this.state.x.ticks = this.getTicks("x");
    this.state.y.ticks = this.getTicks("y");
  }

  getStyles() {
    return _.merge({
      width: 500,
      height: 200,
      margin: 40,
      xAxis: {
        stroke: "black",
        fill: "none",
        strokeWidth: 1,
        shapeRendering: "crispEdges"
      },
      yAxis: {
        stroke: "black",
        fill: "none",
        strokeWidth: 1,
        shapeRendering: "crispEdges"
      }
    }, this.props.style);
  }

  getTransform(type) {
    const range = this.state[type].range;
    return type === "x" ? "translate(" + 0 + "," + range.max + ")"
      : "translate(" + range.min + "," + 0 + ")";
  }

  getScale(type) {
    const scale = type === "x" ?
      this.props.x.scale().range([this.state.x.range.min, this.state.y.range.max])
      : this.props.y.scale().range([this.state.x.range.max, this.state.y.range.min]);
    return scale.domain(this.props[type].domain.min, this.props[type].domain.max)
  }

  getTicks(type) {
    if (this.props[type].tickValues) {
      return this.props[type].tickValues
    }
    return this.props[type].scale(this.props[type]).ticks(this.props[type].ticks)
  }

  getTickSpacing(type) {
    const tickSize = this.props[type].tickSize;
    return Math.max(tickSize.innerTickSize, 0) + tickSize.tickPadding
  }

  getAxisPath(type) {
    const orientation = this.props[type].orient
    if (orientation === "top" || orientation === "bottom") {

    }
  }

  componentDidMount() {
    console.log();
    // const xAxisFunction = d3.svg.axis()
    //   .scale(this.getXScale())
    //   .orient(this.props.x.orient)
    //   .ticks(5, 10)
    //   .tickValues(this.props.x.tickValues);
    // const yAxisFunction = d3.svg.axis()
    //   .scale(this.getYScale())
    //   .orient(this.props.y.orient)
    //   .ticks(5, 10)
    //   .tickValues(this.props.y.tickValues);

    // const xAxis = xAxisFunction(d3.select(React.findDOMNode(this.refs.xAxis)));
    // const yAxis = yAxisFunction(d3.select(React.findDOMNode(this.refs.yAxis)));
    // this.setState({xAxis, yAxis});
  }

  render() {
    const styles = this.getStyles();
    return (
      <g>
        <g ref="xAxis" style={styles.xAxis} transform={this.getTransform("x")}></g>
        <g ref="yAxis" style={styles.yAxis} transform={this.getTransform("y")}></g>
      </g>
    );
  }
}

VictoryAxis.propTypes = {
  style: React.PropTypes.node,
  x: React.PropTypes.shape({
    domain: React.PropTypes.shape({
      min: React.PropTypes.number,
      max: React.PropTypes.number
    }),
    orient: React.PropTypes.oneOf(["top", "bottom", "left", "right"]),
    range: React.PropTypes.shape({
      min: React.PropTypes.number,
      max: React.PropTypes.number
    }),
    scale: React.PropTypes.func, // is this true, or can we pass a string?
    ticks: React.PropTypes.number,
    tickValues: React.PropTypes.array,
    tickSize: React.PropTypes.shape({
      innerTickSize: React.PropTypes.number,
      outerTickSize: React.PropTypes.number,
      tickPadding: React.PropTypes.number
    }),
    tickFormat: React.PropTypes.func
  }),
  y: React.PropTypes.shape({
    domain: React.PropTypes.shape({
      min: React.PropTypes.number,
      max: React.PropTypes.number
    }),
    orient: React.PropTypes.oneOf(["top", "bottom", "left", "right"]),
    range: React.PropTypes.shape({
      min: React.PropTypes.number,
      max: React.PropTypes.number
    }),
    scale: React.PropTypes.func, // is this true, or can we pass a string?
    ticks: React.PropTypes.number,
    tickValues: React.PropTypes.array,
    tickSize: React.PropTypes.shape({
      innerTickSize: React.PropTypes.number,
      outerTickSize: React.PropTypes.number,
      tickPadding: React.PropTypes.number
    }),
    tickFormat: React.PropTypes.func
  })
};

VictoryAxis.defaultProps = {
  x: {
    domain: {min: 0, max: 100},
    orient: "bottom",
    scale: () => d3.scale.linear(),
    ticks: 5,
    tickValues: [20, 40, 60, 80, 100]
  },
  y: {
    domain: {min: 0, max: 100},
    orient: "left",
    scale: () => d3.scale.linear(),
    ticks: 5,
    tickValues: [20, 40, 60, 80, 100]
  }
};

export default VictoryAxis;
