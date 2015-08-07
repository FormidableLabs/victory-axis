import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

@Radium
class VictoryAxis extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.state.range = this.getRange();
    this.state.domain = this.getDomain();
    this.state.scale = this.setupScale();
    this.state.ticks = this.getTicks();
    this.state.tickFormat = this.getTickFormat();
    this.state.tickSpacing = _.max([this.props.innerTickSize, 0]) + this.props.tickPadding;
    this.minimumMargin = 50;
  }

  getStyles() {
    return _.merge({
      width: "500",
      height: "200",
      stroke: "black",
      fill: "none",
      strokeWidth: 1,
      shapeRendering: "crispEdges"
    }, this.props.style);
  }

  getMarginValues() {
    const style = this.getStyles();
    const top = parseInt(style.marginTop, 10) || this.minimumMargin;
    const bottom = parseInt(style.marginBottom, 10) || this.minimumMargin;
    const left = parseInt(style.marginLeft, 10) || this.minimumMargin;
    const right = parseInt(style.marginRight, 10) || this.minimumMargin;
    const orientation = this.props.orientation;
    return {
      top: orientation === "top" ? _.max([top, this.minimumMargin]) : top,
      bottom: orientation === "bottom" ? _.max([bottom, this.minimumMargin]) : bottom,
      left: orientation === "left" ? _.max([left, this.minimumMargin]) : left,
      right: orientation === "right" ? _.max([right, this.minimumMargin]) : right
    };
  }

  getDomain() {
    let domain;
    if (this.props.domain) {
      domain = this.props.domain;
    } else if (this.props.tickValues) {
      domain = [_.min(this.props.tickValues), _.max(this.props.tickValues)];
    } else {
      domain = this.props.scale().domain();
    }
    return this.isVertical() ? domain.reverse() : domain;
  }

  getRange() {
    const style = this.getStyles();
    const margin = this.getMarginValues();
    if (this.isVertical()) {
      return [margin.top, parseInt(style.height, 10) - margin.bottom];
    } else {
      return [margin.left, parseInt(style.width, 10) - margin.right];
    }
  }

  isVertical() {
    const orientation = this.props.orientation;
    return (orientation === "left" || orientation === "right");
  }


  getTransform() {
    const orientation = this.props.orientation;
    const margin = this.getMarginValues();
    const style = this.getStyles();
    const offset = {
      top: [0, margin.top],
      bottom: [0, (parseInt(style.height, 10) - margin.bottom)],
      left: [margin.left, 0],
      right: [(parseInt(style.width, 10) - margin.right), 0]
    };
    return "translate(" + offset[orientation][0] + "," + offset[orientation][1] + ")";
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
    } else if (_.isFunction(this.state.scale().tickFormat)) {
      return this.state.scale().tickFormat(this.state.ticks.length);
    } else {
      return (x) => x;
    }
  }

  getAxisPath() {
    const orientation = this.props.orientation;
    const range = this.state.range;
    const sign = (orientation === "top" || orientation === "left") ? -1 : 1;
    if (orientation === "top" || orientation === "bottom") {
      return "M" + _.min(range) + "," + sign * this.props.outerTickSize +
        "V0H" + _.max(range) + "V" + sign * this.props.outerTickSize;
    } else {
      return "M" + sign * this.props.outerTickSize + "," + _.min(range) + "H0V" +
        _.max(range) + "H" + sign * this.props.outerTickSize;
    }
  }

  getActiveScale() {
    const scale = this.state.scale;
    if (scale().rangeBand) {
      return (x) => scale(x) + scale.rangeBand() / 2;
    } else {
      return scale;
    }
  }

  getTickProperties() {
    const orientation = this.props.orientation;
    const verticalAxis = this.isVertical();
    // determine axis orientation and layout
    const sign = orientation === "top" || orientation === "left" ? -1 : 1;
    // determine tick formatting constants based on orientationation and layout
    const x = verticalAxis ? sign * this.state.tickSpacing : 0;
    const y = verticalAxis ? 0 : sign * this.state.tickSpacing;
    const x2 = verticalAxis ? sign * this.props.innerTickSize : 0;
    const y2 = verticalAxis ? 0 : sign * this.props.innerTickSize;
    let dy;
    let textAnchor;
    if (verticalAxis) {
      dy = ".32em";
      textAnchor = sign < 0 ? "end" : "start";
    } else {
      dy = sign < 0 ? "0em" : ".71em";
      textAnchor = "middle";
    }
    return {x, y, x2, y2, dy, textAnchor};
  }


  getTickLines() {
    const verticalAxis = this.isVertical();
    const ticks = this.getTicks();
    const properties = this.getTickProperties();
    let position;
    let translate;
    return _.map(ticks, (tick, index) => {
      position = this.getActiveScale().call(this, tick);
      translate = verticalAxis ?
        "translate(0, " + position + ")" : "translate(" + position + ", 0)";
      return (
        <g key={"tick-" + index} className="tick" transform={translate}>
          <line x2={properties.x2} y2={properties.y2} stroke={"black"} />
          <text x={properties.x}
            y={properties.y}
            dy={properties.dy}
            textAnchor={properties.textAnchor}
            fill="black">
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
          x={-((parseInt(style.height, 10) - Math.abs(margin.bottom - margin.top)) / 2)}
          dy={".75em"}
          fill="black"
          transform={"rotate(-90)"}>
          {this.props.label}
        </text>
      );
    } else {
      return (
        <text className={"label"}
          fill="black"
          textAnchor={"middle"}
          x={((parseInt(style.width, 10) + Math.abs(margin.left - margin.right)) / 2)}
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
        <g style={styles} transform={this.getTransform()}>
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
  labelPadding: React.PropTypes.number,
  origin: React.PropTypes.number
};

VictoryAxis.defaultProps = {
  orientation: "bottom",
  scale: () => d3.scale.linear(),
  tickCount: 5,
  tickValues: [0, 20, 40, 60, 80, 100],
  innerTickSize: 4,
  outerTickSize: 0,
  tickPadding: 3,
  label: "",
  labelPadding: 40,
  origin: 0
};

export default VictoryAxis;
