import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

@Radium
class VictoryAxis extends React.Component {

  constructor(props) {
    super(props);
    const style = this.getStyles();
    this.state = {};
    this.state.yRange = {min: style.margin, max: style.height - style.margin};
    this.state.xRange = {min: style.margin, max: style.width - style.margin};
    this.state.ticks = _.isArray(this.props.ticks) ? this.prop.ticks.length : this.props.ticks
  }

  getStyles() {
    return _.merge({
      width: 500,
      height: 200,
      margin: 40,
      xAxis: {
        stroke: "black",
        fill: "none",
        strokeWidth: 0.5,
        shapeRendering: "crispEdges"
      },
      yAxis: {
        stroke: "black",
        fill: "none",
        strokeWidth: 0.5,
        shapeRendering: "crispEdges"
      },
      text: {
        fontFamily: "sans-serif"
      }
    }, this.props.style);
  }

  getXTransform() {
    const range = this.state.yRange
    return "translate(" + 0 + "," + range.max + ")";
  }

  getYTransform() {
    const range = this.state.xRange
    return "translate(" + range.min + "," + 0 + ")";
  }

  getXScale() {
    const style = this.getStyles();
    const scale = this.props.scale().range([this.state.xRange.min, this.state.xRange.max]);
    return scale.domain([this.props.xDomain.min, this.props.xDomain.max]);
  }

  getYScale() {
    const style = this.getStyles();
    const scale = this.props.scale().range([this.state.yRange.max, this.state.yRange.min]);
    return scale.domain([this.props.yDomain.min, this.props.yDomain.max]);
  }


  componentDidMount() {
    const xAxisFunction = d3.svg.axis()
      .scale(this.getXScale())
      .orient("bottom")
      .ticks(this.state.ticks);
    const yAxisFunction = d3.svg.axis()
      .scale(this.getYScale())
      .orient("left")
      .ticks(this.state.ticks)

    const xAxis = xAxisFunction(d3.select(React.findDOMNode(this.refs.xAxis)));
    const yAxis = yAxisFunction(d3.select(React.findDOMNode(this.refs.yAxis)));
    this.setState({xAxis, yAxis});
  }

  render() {
    const styles = this.getStyles();
    return (
      <g>
        <g ref="xAxis" style={styles.xAxis} transform={this.getXTransform()}>{this.state.xAxis}</g>
        <g ref="yAxis" style={styles.yAxis} transform={this.getYTransform()}>{this.state.yAxis}</g>
      </g>
    );
  }
}

VictoryAxis.propTypes = {
  sample: React.PropTypes.number,
  scale: React.PropTypes.func,
  style: React.PropTypes.node,
  ticks: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.number
  ]),
  xRange: React.PropTypes.shape({
    min: React.PropTypes.number,
    max: React.PropTypes.number
  }),
  xDomain: React.PropTypes.shape({
    min: React.PropTypes.number,
    max: React.PropTypes.number
  }),
  yRange: React.PropTypes.shape({
    min: React.PropTypes.number,
    max: React.PropTypes.number
  }),
  yDomain: React.PropTypes.shape({
    min: React.PropTypes.number,
    max: React.PropTypes.number
  })
};

VictoryAxis.defaultProps = {
  sample: 100,
  ticks: 5,
  scale: () => d3.scale.linear(),
  xDomain: {min: 0, max: 100},
  yDomain: {min: 0, max: 100}
};

export default VictoryAxis;
