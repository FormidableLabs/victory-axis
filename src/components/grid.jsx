import React, { PropTypes } from "react";
import Radium from "radium";

@Radium
export default class GridLine extends React.Component {
  static role = "grid";

  static propTypes = {
    transform: PropTypes.string,
    x2: PropTypes.number,
    y2: PropTypes.number,
    style: PropTypes.object
  };

  static defaultProps = {
  };

  render() {
    return (
      <g transform={this.props.transform}>
        <line x2={this.props.x2} y2={this.props.y2} style={this.props.style}/>
      </g>
    );
  }
}
