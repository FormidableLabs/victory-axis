import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

@Radium
class VictoryAxis extends React.Component {

  constructor(props) {
    super(props);
    /*
      Our use-cases are:
      1. The user passes in data as an array of {x: 1, y: 2}-style pairs
      2. The user provides no x; make it from xMin and xMax
      3. The user provides x as an array of points; leave it be
      4. The user provides y as an array of points; leave it be
      5. The user provides y as a function; use x to generate y
     */
    if (this.props.data) {
      this.state = {
        data: this.props.data,
        x: this.props.data.map(row => row.x),
        y: this.props.data.map(row => row.y)
      };
    } else {
      this.state = {};
      this.state.x = this.returnOrGenerateX();
      this.state.y = this.returnOrGenerateY();

      let inter = _.zip(this.state.x, this.state.y);
      let objs = _.map(inter, (obj) => { return {x: obj[0], y: obj[1]}; });

      this.state.data = objs;
    }
  }

  returnOrGenerateX() {
    let step = Math.round(this.props.xMax / this.props.sample, 4);
    return this.props.x
         ? this.props.x
         : _.range(this.props.xMin, this.props.xMax, step)
  }

  returnOrGenerateY() {
    const y = this.props.y;
    if (typeof(y) === "array") {
      return y;
    } else if (typeof(y) === "function") {
      return _.map(this.state.x, (x) => y(x))
    } else {
      // asplode
      return null;
    }
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
        "width": "400",
        "height": "300"
      }
    };
  }

  getXTransform() {
    const styles = this.getStyles();
    const xMargin = {
      left: styles.svg.margin,
      top: styles.svg.height - styles.svg.margin
    }
    return "translate(" + xMargin.left + "," + xMargin.top + ")";
  }

  getYTransform() {
    return "rotate(-90)";
  }

  getXScale() {
    const style = this.getStyles()
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

    let xAxis = xAxisFunction(d3.select(React.findDOMNode(this.refs.xAxis)));
    let yAxis = yAxisFunction(d3.select(React.findDOMNode(this.refs.yAxis)));
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
