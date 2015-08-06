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
    this.state.range = this.getRange()
    // this.state.range = [style.margin, style.width - style.margin];
    this.state.domain = this.getDomain();
    this.state.scale = this.setupScale();
    this.state.ticks = this.getTicks();
    this.state.tickFormat = this.getTickFormat();
    this.state.tickSpacing = _.max([this.props.innerTickSize, 0]) + this.props.tickPadding;
    this.minimumMargin = 40;
  }

  getStyles() {
    return _.merge({
      width: "500",
      height: "200",
      stroke: "black",
      fill: "none",
      strokeWidth: 1,
      shapeRendering: "crispEdges",
    }, this.props.style);
  }

  getMarginValues() {
    const style = this.getStyles();
    const top = style.marginTop  || this.minimumMargin;
    const bottom = style.marginBottom || this.minimumMargin;
    const left = style.marginLeft || this.minimumMargin;
    const right = style.marginRight || this.minimumMargin;
    return {
      top: _.max([parseInt(top, 10), this.minimumMargin]),
      bottom:_.max([parseInt(bottom, 10), this.minimumMargin]),
      left: _.max([parseInt(left, 10), this.minimumMargin]),
      right: _.max([parseInt(right, 10), this.minimumMargin]),
    };
  }

  getDomain() {
    const domain = this.props.domain || this.props.scale().domain()
    return this.isVertical() ? domain.reverse() : domain;
  }

  getRange() {
    const style = this.getStyles();
    const margin = this.getMarginValues();
    if (this.isVertical()) {
      return [margin.top + margin.bottom, parseInt(style.height, 10) - margin.bottom];
    } else {
      return [margin.left, parseInt(style.width, 10) - margin.right - margin.left]
    }
  }

  isVertical() {
    const orientation = this.props.orientation;
    return (orientation === "left" || orientation === "right");
  }

  // getTransform() {
  //   const orientation = this.props.orientation;
  //   const margin = this.getMarginValues();
  //   console.log("WAT MARGIN",margin)
  //   const style = this.getStyles();
  //   if (orientation === "top") {
  //     return "translate(" + 0 + "," + margin.top + ")";
  //   }
  //   if (orientation === "bottom") {
  //     return "translate(" + 0 + "," + (parseInt(style.height, 10) - margin.bottom) + ")";
  //   }
  //   if (orientation === "left") {
  //     return "translate(" + margin.left + "," + 0 + ")";
  //   }
  //   if (orientation === "right") {
  //     return "translate(" + (parseInt(style.width, 10) - margin.right) + "," + 0 + ")";
  //   }
  // }

  getTransform() {
    const orientation = this.props.orientation;
    const margin = this.getMarginValues();
    console.log("WAT MARGIN",margin)
    const style = this.getStyles();
    if (orientation === "top") {
      return "translate(0," + margin.bottom + ")"; // should this really be bottom?
    }
    if (orientation === "bottom") {
      return "translate(0," + (parseInt(style.height, 10) - margin.bottom) + ")";
    }
    if (orientation === "left") {
      return "translate(" + margin.left + ", 0)";
    }
    if (orientation === "right") { // not sure this one is right.  label may be off too
      return "translate(" + (parseInt(style.width, 10) - margin.left) + ", 0)";
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
    const orientation = this.props.orientation
    const range = this.state.range
    const sign = (orientation === "top" || orientation === "left") ? -1 : 1
    if (orientation === "top" || orientation === "bottom") {
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
    const orientation = this.props.orientation;
    const verticalAxis = this.isVertical();
    // determine axis orientation and layout
    const sign = orientation === "top" || orientation === "left" ? -1 : 1;
    // determine tick formatting constants based on orientationation and layout
    const x = verticalAxis ? sign * this.state.tickSpacing : 0;
    const y = verticalAxis ? 0 : sign * this.state.tickSpacing;
    const x2 = verticalAxis ? sign * this.props.innerTickSize : 0;
    const y2 = verticalAxis ? 0 : sign * this.props.innerTickSize;
    const dy = verticalAxis ? ".32em" : (sign < 0 ? "0em" : ".71em");
    const textAnchor = verticalAxis ? (sign < 0 ? "end" : "start") : "middle";
    const ticks = this.getTicks();
    let position, translate;
    return _.map(ticks, (tick, index) => {
       position = this.getActiveScale().call(this, tick);
       translate = verticalAxis ?
        "translate(0, " + position + ")" : "translate(" + position + ", 0)";
      return (
        <g key={"tick-" + index} className="tick" transform={translate}>
          <line x2={x2} y2={y2} stroke={"black"} />
          <text x={x} y={y} dy={dy} textAnchor={textAnchor}>
            {this.getTickFormat().call(this, tick)}
          </text>
        </g>
      );
    });
  }

  getLabelElements() {
    const style = this.getStyles();
    const margin = this.getMarginValues();
    const orientation = this.props.orientation;
    const sign = orientation === "top" || orientation === "left" ? -1 : 1;
    if (this.isVertical()) {
      return (
        <text className={"label"}
          textAnchor={"middle"}
          y={sign * this.props.labelPadding}
          x={-((style.height / 2) - margin.bottom + margin.top)}
          dy={".75em"}
          transform={"rotate(-90)"}>
          {this.props.label}
        </text>
      );
    } else {
      const width = _.max(this.state.range);
      return (
        <text className={"label"}
          textAnchor={"middle"}
          x={((style.width - margin.left - margin.right) / 2)}
          y={sign * this.props.labelPadding}>
          {this.props.label}
        </text>
      );
    }
  }

  render() {
    const styles = this.getStyles();
    return (
      <g>
        <g ref="Axis" style={styles} transform={this.getTransform()}>
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
  orientation: React.PropTypes.oneOf(["top", "bottom", "left", "right"]),
  scale: React.PropTypes.func, // is this right, or should we pass a string?
  tickCount: React.PropTypes.number,
  tickValues: React.PropTypes.array,
  innerTickSize: React.PropTypes.number,
  outerTickSize: React.PropTypes.number,
  tickPadding: React.PropTypes.number,
  tickFormat: React.PropTypes.func,
  label: React.PropTypes.string,
  labelPadding: React.PropTypes.number
};

VictoryAxis.defaultProps = {
  domain: [0, 100],
  orientation: "top",
  scale: () => d3.scale.linear(),
  tickCount: 5,
  tickValues: [20, 40, 60, 80, 100],
  innerTickSize: 3,
  outerTickSize: 3,
  tickPadding: 3,
  label: "axis",
  labelPadding: 25
};

export default VictoryAxis;
