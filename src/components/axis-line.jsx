import _ from "lodash";
import React, { PropTypes } from "react";
import Radium from "radium";
import { VictoryAnimation } from "victory-animation";

@Radium
export default class AxisLine extends React.Component {
  static role = "line";

  static propTypes = {
    animate: PropTypes.object,
    x1: PropTypes.number,
    x2: PropTypes.number,
    y1: PropTypes.number,
    y2: PropTypes.number,
    style: PropTypes.object
  };

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryAxis` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, ["style", "x1", "x2", "y1", "y2"]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <AxisLine {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    }
    return <line {...this.props}/>;
  }
}
