import React from "react";
import Radium from "radium";

@Radium
export default class AxisLine extends React.Component {
  static role = "line";

  render() {
    return <line {...this.props}/>;
  }
}
