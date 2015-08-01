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
    return {
      base: {
        color: "#000",
        fontSize: 12,
        textDecoration: "underline"
      },
      red: {
        color: "#d71920",
        fontSize: 30
      },
      path: {
        "fill": "none",
        "stroke": "darkgrey",
        "strokeWidth": "2px"
      },
      svg: {
        "border": "2px solid black",
        "margin": "20",
        "width": "300",
        "height": "300"
      }
    };
  }

  getXTransform() {
    const styles = this.getStyles();
    const xMargin = {
      left: styles.svg.margin,
      top: styles.svg.height - styles.svg.margin
    };
    return "translate(" + xMargin.left + "," + xMargin.top + ")";
  }

  getYTransform() {
    const styles = this.getStyles();
    const yMargin = {
      left: styles.svg.margin,
      top: styles.svg.margin - styles.svg.height
    }
    return "rotate(-90) translate(" + yMargin.top + "," + yMargin.left + ")";
  }

  getXScale() {
    const style = this.getStyles();
    const scale = this.props.scale(this.props.xMin, style.svg.width);
    return scale.domain(d3.extent(this.state.data, (obj) => obj.x));
  }

  getYScale() {
    const style = this.getStyles()
    const scale = this.props.scale(style.svg.height, this.props.yMin);
    return scale.domain(d3.extent(this.state.data, (obj) => obj.y));
  }


  componentDidMount() {
    const xAxisFunction = d3.svg.axis()
      .scale(this.getXScale())
      .orient("bottom");
    const yAxisFunction = d3.svg.axis()
      .scale(this.getYScale())
      .orient("bottom");

    const xAxis = xAxisFunction(d3.select(React.findDOMNode(this.refs.xAxis)));
    const yAxis = yAxisFunction(d3.select(React.findDOMNode(this.refs.yAxis)));
    this.setState({
      xAxis: xAxis,
      yAxis: yAxis
    });
  }

  render() {
    const styles = this.getStyles()
    return (
      <svg style={[styles.svg, this.props.style]}>
        <g>
          <g ref="xAxis" transform={this.getXTransform()}>{this.state.xAxis}</g>
          <g ref="yAxis" transform={this.getYTransform()}>{this.state.yAxis}</g>
        </g>
      </svg>
    );
  }
}

VictoryAxis.propTypes = {
  data: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      x: React.PropTypes.number,
      y: React.PropTypes.number
    })
  ),
  xMin: React.PropTypes.number,
  yMin: React.PropTypes.number,
  xMax: React.PropTypes.number,
  yMax: React.PropTypes.number,
  sample: React.PropTypes.number,
  x: React.PropTypes.array,
  y: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.func
  ]),
  scale: React.PropTypes.func
};

VictoryAxis.defaultProps = {
  xMin: 0,
  yMin: 0,
  xMax: 100,
  yMax: 100,
  data: null,
  sample: 100,
  x: null,
  y: () => Math.random(),
  scale: (min, max) => d3.scale.linear().range([min, max]),
};

export default VictoryAxis;
