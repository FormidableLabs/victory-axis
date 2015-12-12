import _ from "lodash";
import React, { PropTypes } from "react";
import Radium from "radium";
import { VictoryAnimation } from "victory-animation";


@Radium
export default class GridLine extends React.Component {
  static role = "grid";

  static propTypes = {
    animate: PropTypes.object,
    tick: PropTypes.any,
    x2: PropTypes.number,
    y2: PropTypes.number,
    xTransform: PropTypes.number,
    yTransform: PropTypes.number,
    style: PropTypes.object
  };

  evaluateStyle(style) {
    return _.transform(style, (result, value, key) => {
      result[key] = _.isFunction(value) ? value.call(this, this.props.tick) : value;
    });
  }

  render() {
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, ["style", "x2", "y2", "xTransform", "yTransform"]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <GridLine {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    }
    return (
      <g transform={`translate(${this.props.xTransform}, ${this.props.yTransform})`}>
        <line
          x2={this.props.x2}
          y2={this.props.y2}
          style={this.evaluateStyle(this.props.style)}
        />
      </g>
    );
  }
}
