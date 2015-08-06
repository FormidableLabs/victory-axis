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
    this.state.range = this.props.range || [style.margin, style.width - style.margin];
    this.state.domain = this.props.domain || this.props.scale().domain();
    this.state.scale = this.setupScale();
    this.state.ticks = this.getTicks();
    this.state.tickFormat = this.getTickFormat();
    this.state.tickSpacing = _.max([this.props.innerTickSize, 0]) + this.props.tickPadding;
  }

  getStyles() {
    return _.merge({
      width: 500,
      height: 200,
      margin: 40,
      stroke: "black",
      fill: "none",
      strokeWidth: 1,
      shapeRendering: "crispEdges"
    }, this.props.style);
  }

  getTransform() {
    const range = this.state.range;
    const orient = this.props.orient;
    if (orient === "top") {
      return "translate(" + 0 + "," + _.min(range) + ")";
    }
    if (orient === "bottom") {
      return "translate(" + 0 + "," + _.max(range) + ")";
    }
    if (orient === "left") {
      return "translate(" + _.min(range) + "," + 0 + ")";
    }
    if (orient === "right") {
      return "translate(" + _.max(range) + "," + 0 + ")";
    }
  }

  setupScale() {
    const scale = this.props.scale().copy();
    scale.range(this.state.range);
    scale.domain(this.state.domain);
    return scale;
  }

  getTicks() {
    const scale = this.state.scale;
    if (this.props.tickValues) {
      return this.props.tickValues;
    } else if (_.isFunction(scale().ticks)) {
      return scale().ticks(this.props.tickCount);
    } else {
      return scale().domain();
    }
  }

  getTickFormat() {
    if (this.props.tickFormat) {
      return this.props.tickFormat;
    } else if (_.isFunction(this.props.scale.tickFormat)) {
      return this.props.scale().tickFormat(this.state.ticks.length);
    } else {
      return (x) => x;
    }
  }

  getAxisPath() {
    const orient = this.props.orient
    const range = this.state.range
    const sign = (orient === "top" || orient === "left") ? -1 : 1
    if (orient === "top" || orient === "bottom") {
      return "M" + _.min(range) + "," + sign * this.props.outerTickSize +
        "V0H" + _.max(range) + "V" + sign * this.props.outerTickSize
    } else {
      return "M" + sign * this.props.outerTickSize + "," + _.min(range) + "H0V" +
        _.max(range) + "H" + sign * this.props.outerTickSize
    }
  }

  getActiveScale() {
    const scale = this.state.scale;
    if (scale().rangeBand) {
      return (x) => scale(x) + scale.rangeBand() / 2;
    }
    else {
      return scale;
    }
  }

  getTickLines() {
    const orient = this.props.orient;
    // determine axis orientation and layout
    const verticalAxis = orient === "left" || orient === "right";
    const sign = orient === "top" || orient === "left" ? -1 : 1;
    // determine tick formatting constants based on orientation and layout
    const x = verticalAxis ? sign * this.state.tickSpacing : 0;
    const y = verticalAxis ? 0 : sign * this.state.tickSpacing;
    const x2 = verticalAxis ? sign * this.props.innerTickSize : 0;
    const y2 = verticalAxis ? 0 : sign * this.props.innerTickSize;
    const dy = verticalAxis ? ".32em" : (sign < 0 ? "0em" : ".71em");
    const textAnchor = verticalAxis ? (sign < 0 ? "end" : "start") : "middle";
    const ticks = this.getTicks();
    let position, translate;
    return _.map(ticks, (tick, index) => {
       position = this.getActiveScale().call(tick);
       translate = verticalAxis ?
        "translate(0, " + position + ")" : "translate(" + position + ", 0)";
      return (
        <g key={"tick-" + index} className="tick" transform={translate}>
          <line x2={x2} y2={y2} stroke={"black"} />
          <text x={x} y={y} dy={dy} textAnchor={textAnchor}>
            {this.state.scale.tickFormat(tick)}
          </text>
        </g>
      );
    });
  }

  getLabelElements() {
    if (this.props.orient === "left" || this.props.orient === "right") {
      return (
        <text className={"label"}
          textAnchor={"end"}
          y={6}
          dy={".75em"}
          transform={"rotate(-90)"}>
          "okay"
        </text>
      );
    } else {
      const width = _.max(this.state.range);
      return (
        <text className={"label"}
          textAnchor={"end"}
          x={width}
          y={-6}>
          "okay"
        </text>
      );
    }
  }

  render() {
    const styles = this.getStyles();
    return (
      <g>
        <g ref="xAxis" style={styles} transform={this.getTransform()}>
          {this.getTickLines()}
          <path d={this.getAxisPath()} />
          {this.getLabelElements()}
        </g>
      </g>
    );
  }
}

VictoryAxis.propTypes = {
  style: React.PropTypes.node,
  domain: React.PropTypes.array,
  orient: React.PropTypes.oneOf(["top", "bottom", "left", "right"]),
  range: React.PropTypes.array,
  scale: React.PropTypes.func, // is this right, or should we pass a string?
  tickCount: React.PropTypes.number,
  tickValues: React.PropTypes.array,
  innerTickSize: React.PropTypes.number,
  outerTickSize: React.PropTypes.number,
  tickPadding: React.PropTypes.number,
  tickFormat: React.PropTypes.func
};

VictoryAxis.defaultProps = {
  domain: [0, 100],
  orient: "bottom",
  scale: () => d3.scale.linear(),
  tickCount: 5,
  tickValues: [20, 40, 60, 80, 100],
  innerTickSize: 3,
  outerTickSize: 3,
  tickPadding: 3
};

export default VictoryAxis;
