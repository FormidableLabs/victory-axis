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
    this.state.scale = this.setupScale(); // set up a scale with domain and range
    this.state.ticks = this.getTicks();
    this.state.tickFormat = this.getTickFormat();
    this.state.tickSpacing = _.max([this.props.innerTickSize, 0]) + this.props.tickPadding;
  }

  getStyles() {
    return _.merge({
      width: 500,
      height: 200,
      stroke: "black",
      fill: "none",
      strokeWidth: 1,
      shapeRendering: "crispEdges"
    }, this.props.style);
  }

  getMarginValues() {
    const minimumMargin = 50;
    const style = this.getStyles();
    const top = style.marginTop || minimumMargin;
    const bottom = style.marginBottom || minimumMargin;
    const left = style.marginLeft || minimumMargin;
    const right = style.marginRight || minimumMargin;
    const orientation = this.props.orientation;
    return {
      top: orientation === "top" ? _.max([top, minimumMargin]) : top,
      bottom: orientation === "bottom" ? _.max([bottom, minimumMargin]) : bottom,
      left: orientation === "left" ? _.max([left, minimumMargin]) : left,
      right: orientation === "right" ? _.max([right, minimumMargin]) : right
    };
  }

  getDomain() {
    let domain;
    if (this.props.domain) {
      domain = this.props.domain;
    } else if (this.props.tickValues) {
      domain = [_.min(this.props.tickValues), _.max(this.props.tickValues)];
    } else {
      // we use this.props.scale here, since domain needs to be set on
      // this.state.scale
      domain = this.props.scale().domain();
    }
    return this.isVertical() ? domain.reverse() : domain;
  }

  getRange() {
    const margin = this.getMarginValues();
    if (this.isVertical()) {
      return [margin.top, this.props.height - margin.bottom];
    } else {
      return [margin.left, this.props.width - margin.right];
    }
  }

  isVertical() {
    const orientation = this.props.orientation;
    return (orientation === "left" || orientation === "right");
  }

  getTransform() {
    const orientation = this.props.orientation;
    const margin = this.getMarginValues();
    const offset = {
      top: [0, margin.top],
      bottom: [0, (this.props.height - margin.bottom)],
      left: [margin.left, 0],
      right: [(this.props.width - margin.right), 0]
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
    } else if (_.isFunction(scale.ticks)) {
      return scale.ticks(this.props.tickCount);
    } else {
      return scale.domain();
    }
  }

  getTickFormat() {
    const scale = this.state.scale;
    if (this.props.tickFormat) {
      return this.props.tickFormat;
    } else if (_.isFunction(scale.tickFormat)) {
      return scale.tickFormat(this.state.ticks.length);
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
    if (scale.rangeBand) {
      return (x) => scale(x) + scale.rangeBand() / 2;
    }
    return scale;
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
        <g key={"tick-" + index} transform={translate}>
          <line x2={properties.x2} y2={properties.y2} stroke="black" />
          <text x={properties.x}
            y={properties.y}
            dy={properties.dy}
            textAnchor={properties.textAnchor}
            fill="black">
            {this.state.tickFormat(tick)}
          </text>
        </g>
      );
    });
  }

  getLabelElements() {
    const margin = this.getMarginValues();
    const orientation = this.props.orientation;
    const sign = (orientation === "top" || orientation === "left") ? -1 : 1;
    const x = this.isVertical() ?
      -((this.props.height - Math.abs(margin.bottom - margin.top)) / 2)
      : ((this.props.width + Math.abs(margin.left - margin.right)) / 2);
    return (
      <text
        textAnchor="middle"
        y={sign * this.props.labelPadding}
        x={x}
        dy={this.isVertical() ? ".75em" : ""}
        fill="black"
        transform={this.isVertical() ? "rotate(-90)" : ""}>
        {this.props.label}
      </text>
    );
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
  width: React.PropTypes.number,
  height: React.PropTypes.number
};

VictoryAxis.defaultProps = {
  orientation: "bottom",
  scale: () => d3.scale.linear(),
  tickCount: 5,
  innerTickSize: 4,
  outerTickSize: 0,
  tickPadding: 3,
  label: "",
  labelPadding: 40,
  width: 500,
  height: 300
};

export default VictoryAxis;
