import React, { PropTypes } from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";
import {VictoryAnimation} from "victory-animation";
import {VictoryLabel} from "victory-label";
import * as VictoryPropTypes from "victory-util/lib/prop-types";

const defaultStyles = {
  line: {
    stroke: "#756f6a",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round"
  },
  label: {
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
    parent: {
      padding: 5
    },
    line: {
      stroke: "#756f6a",
      fill: "none",
      strokeWidth: 2,
      strokeLinecap: "round",
      size: 4
    },
    label: {
      stroke: "transparent",
      fill: "#756f6a",
      fontFamily: "Helvetica",
      fontSize: 10,
      padding: 5
    }
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
     * @exampes [-1, 1]
     */
    domain: VictoryPropTypes.minMaxArray,
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: VictoryPropTypes.nonNegative,
    /**
     * The label prop specifies the label for your axis
     */
    label: PropTypes.string,
    /**
     * The labelPadding prop specifies the padding in pixels for you axis label
     */
    labelPadding: PropTypes.number,
    /**
     * This value describes how far from the "edge" of it's permitted area each axis
     * will be set back in the x-direction.  If this prop is not given,
     * the offset is calculated based on font size, axis orientation, and label padding.
     */
    offsetX: PropTypes.number,
    /**
     * This value describes how far from the "edge" of it's permitted area each axis
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
     * given as a function,
     * @examples d3.time.scale()
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
     * styles for axis lines, gridlines, and ticks are scoped to separate props.
     * @examples {axis: {stroke: "#756f6a"}, grid: {stroke: "grey"}, ticks: {stroke: "grey"},
     * tickLabels: {fontSize: 10, padding: 5}, axisLabels: {fontSize: 16, padding: 20}}
     */
    style: PropTypes.shape({
      parent: PropTypes.object,
      line: PropTypes.object,
      label: PropTypes.object,
      grid: PropTypes.shape({
        parent: PropTypes.object,
        line: PropTypes.object
      }),
      ticks: PropTypes.shape({
        parent: PropTypes.object,
        line: PropTypes.object,
        label: PropTypes.object
      })
    }),
    /**
     * The tickCount prop specifies how many ticks should be drawn on the axis if
     * ticksValues are not explicitly provided.
     */
    tickCount: VictoryPropTypes.nonNegative,
    /**
     * The tickFormat prop specifies how tick values should be expressed visually.
     * tickFormat can be given as a function to be applied to every tickValue, or as
     * an array of display values for each tickValue
     * @examples d3.time.format("%Y"), (x) => x.toPrecision(2), ["first", "second", "third"]
     */
    tickFormat: PropTypes.oneOfType([
      PropTypes.func,
      VictoryPropTypes.homogenousArray
    ]),
    /**
     * The tickValues prop explicity specifies which ticks values to draw on the axis.
     * @examples ["apples", "bananas", "oranges"], [2, 4, 6, 8]
     */
    tickValues: VictoryPropTypes.homogenousArray,
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: VictoryPropTypes.nonNegative
  };

  static defaultProps = {
    height: 300,
    padding: 50,
    scale: d3.scale.linear(),
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
    this.range = this.getRange(props);
    this.domain = this.getDomain(props);
    this.scale = this.getScale(props);
    this.ticks = this.getTicks(props);
    this.labelPadding = this.getLabelPadding(props);
    this.offset = this.getOffset(props);
  }

  getOrientation(props) {
    return props.orientation || (props.dependentAxis ? "left" : "bottom");
  }

  getStyles(props) {
    const style = props.style || {};
    const parentStyleProps = { height: props.height, width: props.width };
    return {
      parent: _.merge(parentStyleProps, defaultStyles.parent, style.parent),
      line: _.merge({}, defaultStyles.line, style.line),
      label: _.merge({}, defaultStyles.label, style.label),
      grid: _.merge({}, defaultStyles.grid, style.grid),
      ticks: _.merge({}, defaultStyles.ticks, style.ticks)
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
    if (typeof props.tickValues[0] === "string") {
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
      if (typeof props.tickValues[0] === "string") {
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
    } else if (props.tickValues && typeof props.tickValues[0] === "string") {
      return (x, index) => props.tickValues[index];
    } else if (_.isFunction(this.scale.tickFormat())) {
      return this.scale.tickFormat(this.ticks.length);
    } else {
      return _.identity;
    }
  }

  getLabelPadding(props) {
    const style = this.style.label;
    if (typeof style.padding !== "undefined" && style.padding !== null) {
      return style.padding;
    }
    // TODO: magic numbers
    return props.label ? (style.fontSize * (this.isVertical ? 2.3 : 1.6)) : 0;
  }

  getOffset(props) {
    const xPadding = props.orientation === "right" ? this.padding.right : this.padding.left;
    const yPadding = props.orientation === "top" ? this.padding.top : this.padding.bottom;
    const fontSize = this.style.label.fontSize;
    const offsetX = props.offsetX || xPadding;
    const offsetY = props.offsetY || yPadding;
    const totalPadding = fontSize + (2 * this.style.ticks.line.size) + this.labelPadding;
    const minimumPadding = 1.2 * fontSize; // TODO: magic numbers
    const x = this.isVertical ? totalPadding : minimumPadding;
    const y = this.isVertical ? minimumPadding : totalPadding;
    return {
      x: offsetX || x,
      y: offsetY || y
    };
  }

  getTickProperties() {
    const style = this.style.ticks;
    const tickSpacing = style.line.size + style.parent.padding;
    const sign = orientationSign[this.orientation];
    return this.isVertical ? {
      x: sign * tickSpacing,
      x2: sign * style.line.size,
      y: 0,
      y2: 0,
      textAnchor: sign < 0 ? "end" : "start",
      verticalAnchor: "middle"
    } : {
      x: 0,
      x2: 0,
      y: sign * tickSpacing,
      y2: sign * style.line.size,
      textAnchor: "middle",
      verticalAnchor: sign < 0 ? "end" : "start"
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

  renderAxisLine() {
    const props = this.isVertical ? {
      y1: this.padding.top,
      y2: this.props.height - this.padding.bottom
    } : {
      x1: this.padding.left,
      x2: this.props.width - this.padding.right
    };
    return <line {...props} style={this.style.line}/>;
  }

  renderTicks() {
    const style = this.style.ticks;
    const props = this.getTickProperties(this.props);
    const tickFormat = this.getTickFormat(this.props);
    // determine the position and translation of each tick
    return _.map(this.ticks, (tick, index) => {
      const position = this.scale(tick);
      const transform = this.isVertical ?
        `translate(0, ${position})` :
        `translate(${position}, 0)`;
      return (
        <g key={`tick-${index}`} transform={transform}>
          <line x2={props.x2} y2={props.y2} style={style.line}/>
          <VictoryLabel
            x={props.x}
            y={props.y}
            style={style.label}
            textAnchor={props.textAnchor}
            verticalAnchor={props.verticalAnchor}
          >
            {tickFormat.call(this, tick, index)}
          </VictoryLabel>
        </g>
      );
    });
  }

  renderGridLines() {
    const xPadding = this.orientation === "right" ? this.padding.right : this.padding.left;
    const yPadding = this.orientation === "top" ? this.padding.top : this.padding.bottom;
    const sign = -orientationSign[this.orientation];
    const xOffset = this.props.crossAxis ? this.offset.x - xPadding : 0;
    const yOffset = this.props.crossAxis ? this.offset.y - yPadding : 0;
    const x2 = this.isVertical ?
      sign * (this.props.width - (this.padding.left + this.padding.right)) : 0;
    const y2 = this.isVertical ?
      0 : sign * (this.props.height - (this.padding.top + this.padding.bottom));
    return _.map(this.ticks, (tick, index) => {
      // determine the position and translation of each gridline
      const position = this.scale(tick);
      const transform = this.isVertical ?
        `translate(${-xOffset}, ${position})` :
        `translate(${position}, ${yOffset})`;
      return (
        <g key={`grid-${index}`} transform={transform}>
          <line x2={x2} y2={y2} style={this.style.grid}/>
        </g>
      );
    });
  }

  renderLabel() {
    if (this.props.label) {
      const sign = orientationSign[this.orientation];
      const hPadding = this.padding.left + this.padding.right;
      const vPadding = this.padding.top + this.padding.bottom;
      const x = this.isVertical ?
        -((this.props.height - vPadding) / 2) - this.padding.top :
        ((this.props.width - hPadding) / 2) + this.padding.left;
      return (
        <VictoryLabel
          x={x}
          y={sign * this.labelPadding}
          textAnchor="middle"
          verticalAnchor={sign < 0 ? "end" : "start"}
          style={this.style.label}
          transform={this.isVertical ? "rotate(-90)" : ""}
        >
          {this.props.label}
        </VictoryLabel>
      );
    }
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
    const transform = this.getTransform(this.props);
    const group = (
      <g style={this.style.parent} transform={transform}>
        {this.renderGridLines()}
        {this.renderAxisLine()}
        {this.renderTicks()}
        {this.renderLabel()}
      </g>
    );
    return this.props.standalone ? (
      <svg style={this.style.parent}>
        {group}
      </svg>
    ) : group;
  }
}
