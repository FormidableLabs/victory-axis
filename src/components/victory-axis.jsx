import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

@Radium
class VictoryAxis extends React.Component {

  constructor(props) {
    super(props);
  }

  getStyles() {
    return _.merge({
      width: 300,
      height: 300,
      margin: 40,
      xAxis: {
        stroke: "green",
        fill: "green"
      }
    }, this.props.style);
  }

  getXTransform() {
    const styles = this.getStyles();
    const xMargin = {
      left: 0,
      top: styles.height - styles.margin
    };
    return "translate(" + xMargin.left + "," + xMargin.top + ")";
  }

  getYTransform() {
    const styles = this.getStyles();
    const yMargin = {
      left: styles.margin,
      top: 0
    };
    return "translate(" + yMargin.left + "," + yMargin.top + ")";
  }

  getXScale() {
    const style = this.getStyles();
    const scale = this.props.scale(style.margin, style.width - style.margin);
    return scale.domain([this.props.xMin, this.props.xMax]);
  }

  getYScale() {
    const style = this.getStyles();
    const scale = this.props.scale(style.height - style.margin, style.margin);
    return scale.domain([this.props.yMin, this.props.yMax]);
  }


  componentDidMount() {
    const xAxisFunction = d3.svg.axis()
      .scale(this.getXScale())
      .orient("bottom");
    const yAxisFunction = d3.svg.axis()
      .scale(this.getYScale())
      .orient("left");

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
  xMin: React.PropTypes.number,
  xMax: React.PropTypes.number,
  yMin: React.PropTypes.number,
  yMax: React.PropTypes.number
};

VictoryAxis.defaultProps = {
  sample: 100,
  scale: (min, max) => d3.scale.linear().range([min, max]),
  xMax: 100,
  xMin: 0,
  yMax: 100,
  yMin: 0
};

export default VictoryAxis;
