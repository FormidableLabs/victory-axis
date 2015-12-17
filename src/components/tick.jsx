import _ from "lodash";
import React, { PropTypes } from "react";
import Radium from "radium";
import { VictoryLabel } from "victory-label";
import { getRole } from "../util";

const orientationSign = {
  top: -1,
  left: -1,
  right: 1,
  bottom: 1
};

const anchorOrientation = {
  top: "end",
  left: "end",
  right: "start",
  bottom: "start"
};

const orientationVerticality = {
  top: false,
  bottom: false,
  left: true,
  right: true
};

@Radium
export default class Tick extends React.Component {
  static role = "tick";

  static propTypes = {
    position: PropTypes.number,
    tick: PropTypes.any,
    orientation: PropTypes.oneOf(["top", "bottom", "left", "right"]),
    style: PropTypes.object,
    label: PropTypes.any
  };

  getCalculatedValues(props) {
    const style = props.style.ticks;
    const tickSpacing = style.size + style.padding;
    const sign = orientationSign[props.orientation];
    const anchor = anchorOrientation[props.orientation];
    const isVertical = orientationVerticality[props.orientation];
    this.transform = isVertical ?
      `translate(0, ${props.position})` : `translate(${props.position}, 0)`;
    this.x = isVertical ? sign * tickSpacing : 0;
    this.x2 = isVertical ? sign * style.size : 0;
    this.y = isVertical ? 0 : sign * tickSpacing;
    this.y2 = isVertical ? 0 : sign * style.size;
    this.textAnchor = isVertical ? anchor : "middle";
    this.verticalAnchor = isVertical ? "middle" : anchor;
  }

  evaluateStyle(style) {
    return _.transform(style, (result, value, key) => {
      result[key] = _.isFunction(value) ? value.call(this, this.props.tick) : value;
    });
  }

  renderLabel() {
    const isComponent = getRole(this.props.label) === "label";
    const props = isComponent ? this.props.label.props : {};
    const style = props.style || this.props.style.tickLabels;
    const newProps = {
      x: this.x,
      y: this.y,
      textAnchor: props.textAnchor || this.textAnchor,
      verticalAnchor: props.verticalAnchor || this.verticalAnchor,
      style: this.evaluateStyle(style)
    };
    return isComponent ?
      React.cloneElement(this.props.label, newProps) :
      React.createElement(VictoryLabel, newProps, this.props.label);
  }


  renderTick(props) {
    return (
      <line
        x={this.x}
        x2={this.x2}
        y={this.y}
        y2={this.y2}
        style={this.evaluateStyle(props.style.ticks)}
      />
    );
  }

  render() {
    this.getCalculatedValues(this.props);
    return (
      <g transform={this.transform}>
        {this.renderTick(this.props)}
        {this.renderLabel(this.props)}
      </g>
    );
  }
}
