import React, { PropTypes } from "react";
import Radium from "radium";
import { VictoryLabel } from "victory-label";
import { getRole } from "../util";

@Radium
export default class Tick extends React.Component {
  static role = "tick";

  static propTypes = {
    transform: PropTypes.string,
    x: PropTypes.number,
    x2: PropTypes.number,
    y: PropTypes.number,
    y2: PropTypes.number,
    style: PropTypes.object,
    labelProps: PropTypes.object,
    children: PropTypes.node
  };

  renderLabel() {
    const label = this.props.children; // Only one child allowed.
    const role = getRole(label);
    const props = {
      x: this.props.x,
      y: this.props.y,
      ...this.props.labelProps
    };
    return role === "label" ?
      React.cloneElement(label, props) :
      React.createElement(VictoryLabel, props, label);
  }

  render() {
    return (
      <g transform={this.props.transform}>
        <line x={this.props.x}
          x2={this.props.x2}
          y={this.props.y}
          y2={this.props.y2}
          style={this.props.style}
        />
        {this.renderLabel()}
      </g>
    );
  }
}
