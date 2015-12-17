import React, { PropTypes } from "react";
import Radium from "radium";
import d3Scale from "d3-scale";
import _ from "lodash";
import {VictoryLabel} from "victory-label";
import { VictoryAnimation } from "victory-animation";
import AxisLine from "./axis-line";
import GridLine from "./grid";
import Tick from "./tick";
import * as VictoryPropTypes from "victory-util/lib/prop-types";

const defaultStyles = {
  axis: {
    stroke: "#756f6a",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round"
  },
  axisLabel: {
    stroke: "transparent",
    fill: "#756f6a",
    fontSize: 16,
    fontFamily: "Helvetica"
  },
  grid: {
    stroke: "#c9c5bb",
    fill: "none",
    strokeWidth: 0,
    strokeLinecap: "round"
  },
  ticks: {
    stroke: "#756f6a",
    fill: "none",
    padding: 5,
    strokeWidth: 2,
    strokeLinecap: "round",
    size: 4
  },
  tickLabels: {
    stroke: "transparent",
    fill: "#756f6a",
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 5
  }
};

const orientationSign = {
  top: -1,
  left: -1,
  right: 1,
  bottom: 1
};

const orientationVerticality = {
  top: false,
  bottom: false,
  left: true,
  right: true
};

@Radium
export default class VictoryAxis extends React.Component {
  static role = "axis";
  static propTypes = {
    /**
     * The animate prop specifies props for victory-animation to use. It this prop is
     * not given, the axis will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {velocity: 0.02, onEnd: () => alert("done!")}
     */
    animate: PropTypes.object,
    /**
     * This prop specifies whether a given axis is intended to cross another axis.
     */
    crossAxis: PropTypes.bool,
    /**
     * The dependentAxis prop specifies whether the axis corresponds to the
     * dependent variable (usually y). This prop is useful when composing axis
     * with other components to form a chart.
     */
    dependentAxis: PropTypes.bool,
    /**
     * The domain prop describes the range of values your axis will include. This prop should be
     * given as a array of the minimum and maximum expected values for your axis.
     * If this value is not given it will be calculated based on the scale or tickValues.
     * @examples [-1, 1]
     */
    domain: VictoryPropTypes.domain,
    /**
     * The height prop specifies the height of the chart container element in pixels.
     */
    height: VictoryPropTypes.nonNegative,
    /**
     * The label prop specifies the label for your axis. This prop can be a string or
     * a label component.
     */
    label: PropTypes.any,
    /**
     * The labelPadding prop specifies the padding in pixels for your axis label.
     */
    labelPadding: PropTypes.number,
    /**
     * This value describes how far from the "edge" of its permitted area each axis
     * will be set back in the x-direction.  If this prop is not given,
     * the offset is calculated based on font size, axis orientation, and label padding.
     */
    offsetX: PropTypes.number,
    /**
     * This value describes how far from the "edge" of its permitted area each axis
     * will be set back in the y-direction.  If this prop is not given,
     * the offset is calculated based on font size, axis orientation, and label padding.
     */
    offsetY: PropTypes.number,
    /**
     * The orientation prop specifies the position and orientation of your axis.
     */
    orientation: PropTypes.oneOf(["top", "bottom", "left", "right"]),
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
      })
    ]),
    /**
     * The scale prop determines which scales your axis should use. This prop should be
     * given as a function.
     * @examples d3Scale.time()
     */
    scale: VictoryPropTypes.scale,
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryAxis with other components within an enclosing <svg> tag.
     */
    standalone: PropTypes.bool,
    /**
     * The style prop specifies styles for your chart. Victory Axis relies on Radium,
     * so valid Radium style objects should work for this prop, however height, width, and margin
     * are used to calculate range, and need to be expressed as a number of pixels.
     * Styles for axis lines, gridlines, and ticks are scoped to separate props.
     * @examples {axis: {stroke: "#756f6a"}, grid: {stroke: "grey"}, ticks: {stroke: "grey"},
     * tickLabels: {fontSize: 10, padding: 5}, axisLabel: {fontSize: 16, padding: 20}}
     */
    style: PropTypes.shape({
      parent: PropTypes.object,
      axis: PropTypes.object,
      axisLabel: PropTypes.object,
      grid: PropTypes.object,
      ticks: PropTypes.object,
      tickLabels: PropTypes.object
    }),
    /**
     * The tickCount prop specifies how many ticks should be drawn on the axis if
     * tickValues are not explicitly provided.
     */
    tickCount: VictoryPropTypes.nonNegative,
    /**
     * The tickFormat prop specifies how tick values should be expressed visually.
     * tickFormat can be given as a function to be applied to every tickValue, or as
     * an array of display values for each tickValue.
     * @examples d3.time.format("%Y"), (x) => x.toPrecision(2), ["first", "second", "third"]
     */
    tickFormat: PropTypes.oneOfType([
      PropTypes.func,
      VictoryPropTypes.homogeneousArray
    ]),
    /**
     * The tickValues prop explicitly specifies which tick values to draw on the axis.
     * @examples ["apples", "bananas", "oranges"], [2, 4, 6, 8]
     */
    tickValues: VictoryPropTypes.homogeneousArray,
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: VictoryPropTypes.nonNegative
  };

  static defaultProps = {
    height: 300,
    padding: 50,
    scale: d3Scale.linear(),
    standalone: true,
    tickCount: 5,
    width: 450
  };

  getCalculatedValues(props) {
    // order matters!
    this.style = this.getStyles(props);
    this.padding = this.getPadding(props);
    this.orientation = this.getOrientation(props);
    this.isVertical = orientationVerticality[this.orientation];
    this.stringTicks = (this.props.tickValues && typeof this.props.tickValues[0] === "string");
    this.range = this.getRange(props);
    this.domain = this.getDomain(props);
    this.scale = this.getScale(props);
    this.ticks = this.getTicks(props);
    this.labelPadding = this.getLabelPadding(props);
    this.offset = this.getOffset(props);
    this.transform = this.getTransform(props);
  }

  getOrientation(props) {
    return props.orientation || (props.dependentAxis ? "left" : "bottom");
  }

  getStyles(props) {
    const style = props.style || {};
    const parentStyleProps = { height: props.height, width: props.width };
    return {
      parent: _.merge(parentStyleProps, defaultStyles.parent, style.parent),
      axis: _.merge({}, defaultStyles.axis, style.axis),
      axisLabel: _.merge({}, defaultStyles.axisLabel, style.axisLabel),
      grid: _.merge({}, defaultStyles.grid, style.grid),
      ticks: _.merge({}, defaultStyles.ticks, style.ticks),
      tickLabels: _.merge({}, defaultStyles.tickLabels, style.tickLabels)
    };
  }

  getPadding(props) {
    const padding = props.padding || 0;
    if (typeof padding === "number") {
      return {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding
      };
    }
    return {
      top: padding.top || 0,
      right: padding.right || 0,
      bottom: padding.bottom || 0,
      left: padding.left || 0
    };
  }

  getDomain(props) {
    if (props.domain) {
      return props.domain;
    } else if (props.tickValues) {
      return this._getDomainFromTickValues(props);
    }
    return this._getDomainFromScale(props);
  }

  // helper for getDomain()
  _getDomainFromTickValues(props) {
    let domain;
    // Since we declared that `tickValues` must be a homogenous array, we only
    // need to do a string check on the first item.
    if (this.stringTicks) {
      domain = [1, props.tickValues.length];
    } else {
      // coerce ticks to numbers
      const ticks = _.map(props.tickValues, Number);
      domain = [_.min(ticks), _.max(ticks)];
    }
    if (this.isVertical) {
      domain.reverse();
    }
    return domain;
  }

  // helper for getDomain()
  _getDomainFromScale(props) {
    return props.scale.domain();
  }

  getRange(props) {
    return this.isVertical ?
      [props.height - this.padding.bottom, this.padding.top] :
      [this.padding.left, props.width - this.padding.right];
  }

  getScale(props) {
    const scale = props.scale.copy();
    scale.range(this.range);
    scale.domain(this.domain);
    return scale;
  }

  getTicks(props) {
    if (props.tickValues) {
      // Since we declared that `tickValues` must be a homogenous array, we only
      // need to do a string check on the first item.
      if (this.stringTicks) {
        return _.range(1, props.tickValues.length + 1);
      }
      return props.tickValues;
    } else if (_.isFunction(this.scale.ticks)) {
      const ticks = this.scale.ticks(props.tickCount);
      if (props.crossAxis) {
        return _.includes(ticks, 0) ? _.without(ticks, 0) : ticks;
      }
      return ticks;
    }
    return this.scale.domain();
  }

  getTickFormat(props) {
    if (props.tickFormat && _.isFunction(props.tickFormat)) {
      return props.tickFormat;
    } else if (props.tickFormat && _.isArray(props.tickFormat)) {
      return (x, index) => props.tickFormat[index];
    } else if (this.stringTicks) {
      return (x, index) => props.tickValues[index];
    } else if (_.isFunction(this.scale.tickFormat())) {
      return this.scale.tickFormat(this.ticks.length);
    } else {
      return _.identity;
    }
  }

  getLabelPadding(props) {
    const style = this.style.axisLabel;
    if (typeof style.padding !== "undefined" && style.padding !== null) {
      return style.padding;
    }
    // TODO: magic numbers
    return props.label ? (style.fontSize * (this.isVertical ? 2.3 : 1.6)) : 0;
  }

  getOffset(props) {
    const xPadding = props.orientation === "right" ? this.padding.right : this.padding.left;
    const yPadding = props.orientation === "top" ? this.padding.top : this.padding.bottom;
    const fontSize = this.style.axisLabel.fontSize;
    const offsetX = props.offsetX || xPadding;
    const offsetY = props.offsetY || yPadding;
    const totalPadding = fontSize + (2 * this.style.ticks.size) + this.labelPadding;
    const minimumPadding = 1.2 * fontSize; // TODO: magic numbers
    const x = this.isVertical ? totalPadding : minimumPadding;
    const y = this.isVertical ? minimumPadding : totalPadding;
    return {
      x: offsetX || x,
      y: offsetY || y
    };
  }

  getTransform(props) {
    const translate = {
      top: [0, this.offset.y],
      bottom: [0, props.height - this.offset.y],
      left: [this.offset.x, 0],
      right: [props.width - this.offset.x, 0]
    }[this.orientation];
    return `translate(${translate[0]}, ${translate[1]})`;
  }

  renderLine(props) {
    return (
      <AxisLine key="line"
        style={this.style.axis}
        x1={this.isVertical ? null : this.padding.left}
        x2={this.isVertical ? null : props.width - this.padding.right}
        y1={this.isVertical ? this.padding.top : null}
        y2={this.isVertical ? props.height - this.padding.bottom : null}
      />
    );
  }

  renderTicks(props) {
    const tickFormat = this.getTickFormat(props);
    return _.map(this.ticks, (tick, index) => {
      const position = this.scale(tick);
      return (
        <Tick key={`tick-${index}`}
          position={position}
          tick={this.stringTicks ? props.tickValues[tick - 1] : tick}
          orientation={this.orientation}
          label={tickFormat.call(this, tick, index)}
          style={{
            ticks: this.style.ticks,
            tickLabels: this.style.tickLabels
          }}
        />
      );
    });
  }

  renderGrid(props) {
    const xPadding = this.orientation === "right" ? this.padding.right : this.padding.left;
    const yPadding = this.orientation === "top" ? this.padding.top : this.padding.bottom;
    const sign = -orientationSign[this.orientation];
    const xOffset = props.crossAxis ? this.offset.x - xPadding : 0;
    const yOffset = props.crossAxis ? this.offset.y - yPadding : 0;
    const x2 = this.isVertical ?
      sign * (props.width - (this.padding.left + this.padding.right)) : 0;
    const y2 = this.isVertical ?
      0 : sign * (props.height - (this.padding.top + this.padding.bottom));
    return _.map(this.ticks, (tick, index) => {
      // determine the position and translation of each gridline
      const position = this.scale(tick);
      return (
        <GridLine key={`grid-${index}`}
          tick={this.stringTicks ? this.props.tickValues[tick - 1] : tick}
          x2={x2}
          y2={y2}
          xTransform={this.isVertical ? -xOffset : position}
          yTransform={this.isVertical ? position : yOffset}
          style={this.style.grid}
        />
      );
    });
  }

  renderLabel(props) {
    if (!props.label) {
      return undefined;
    }

    const sign = orientationSign[this.orientation];
    const hPadding = this.padding.left + this.padding.right;
    const vPadding = this.padding.top + this.padding.bottom;
    const x = this.isVertical ?
      -((props.height - vPadding) / 2) - this.padding.top :
      ((props.width - hPadding) / 2) + this.padding.left;
    const newProps = {
      key: "label",
      x,
      y: sign * this.labelPadding,
      textAnchor: "middle",
      verticalAnchor: sign < 0 ? "end" : "start",
      style: this.style.axisLabel,
      transform: this.isVertical ? "rotate(-90)" : ""
    };
    return (props.label.props) ?
      React.cloneElement(props.label, newProps) :
      React.createElement(VictoryLabel, newProps, props.label);
  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryAxis` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, [
        "style", "domain", "range", "tickCount", "tickValues",
        "labelPadding", "offsetX", "offsetY", "padding", "width", "height"
      ]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <VictoryAxis {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    } else {
      this.getCalculatedValues(this.props);
    }
    const group = (
      <g style={this.style.parent} transform={this.transform}>
        {this.renderLabel(this.props)}
        {this.renderTicks(this.props)}
        {this.renderLine(this.props)}
        {this.renderGrid(this.props)}
      </g>
    );
    return this.props.standalone ? (
      <svg style={this.style.parent}>
        {group}
      </svg>
    ) : group;
  }
}
