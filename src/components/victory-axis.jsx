import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

@Radium
class VictoryAxis extends React.Component {

  constructor(props) {
    super(props);
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
    return _.merge({
      width: 300,
      height: 300,
      margin: 20,
      xAxis: {
        stroke: "green",
        fill: "green"
      }
    }, this.props.style);
  }

  getXTransform() {
    const styles = this.getStyles();
    const xMargin = {
      left: styles.margin,
      top: styles.height - styles.margin
    };
    return "translate(" + xMargin.left + "," + xMargin.top + ")";
  }

  getYTransform() {
    const styles = this.getStyles();
    const yMargin = {
      left: styles.margin,
      top: -styles.margin
    };
    return "translate(" + yMargin.left + "," + yMargin.top + ")";
  }

  getXScale() {
    const style = this.getStyles();
    const scale = this.props.scale(this.props.xMin, style.width);
    return scale.domain(d3.extent(this.state.data, (obj) => obj.x));
  }

  getYScale() {
    const style = this.getStyles();
    const scale = this.props.scale(style.height, this.props.yMin);
    return scale.domain(d3.extent(this.state.data, (obj) => obj.y));
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
        <g ref="xAxis" style={styles.xAxis} transform={this.getXTransform() }>{this.state.xAxis}</g>
        <g ref="yAxis" style={styles.yAxis} transform={this.getYTransform()}>{this.state.yAxis}</g>
      </g>
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
  sample: React.PropTypes.number,
  scale: React.PropTypes.func,
  style: React.PropTypes.node,
  x: React.PropTypes.array,
  xMin: React.PropTypes.number,
  xMax: React.PropTypes.number,
  y: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.func
  ]),
  yMin: React.PropTypes.number,
  yMax: React.PropTypes.number
};

VictoryAxis.defaultProps = {
  data: null,
  sample: 100,
  scale: (min, max) => d3.scale.linear().range([min, max]),
  x: null,
  xMax: 100,
  xMin: 0,
  y: () => Math.random(),
  yMax: 100,
  yMin: 0
};

export default VictoryAxis;
