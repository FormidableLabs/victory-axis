import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";
import {VictoryAnimation} from "victory-animation";

const defaultStyles = {
  axis: {
    stroke: "#756f6a",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round"
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
    color: "#756f6a",
    size: 4
  },
  tickLabels: {
    stroke: "transparent",
    fill: "#756f6a",
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 5
  },
  axisLabels: {
    stroke: "transparent",
    fill: "#756f6a",
    fontSize: 16,
    fontFamily: "Helvetica"
  }
};

const defaultPadding = 30;

@Radium
export default class VictoryAxis extends React.Component {
  static propTypes = {
    /**
     * The animate prop specifies props for victory-animation to use. It this prop is
     * not given, the axis will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {line: {delay: 5, velocity: 10, onEnd: () => alert("woo!")}}
     */
    animate: React.PropTypes.object,
    /**
     * This prop specifies whether a given axis is intended to cross another axis.
     */
    crossAxis: React.PropTypes.bool,
    /**
     * The dependentAxis prop specifies whether the axis corresponds to the
     * dependent variable (usually y). This prop is useful when composing axis
     * with other components to form a chart.
     */
    dependentAxis: React.PropTypes.bool,
    /**
     * The domain prop describes the range of values your axis will include. This prop should be
     * given as a array of the minimum and maximum expected values for your axis.
     * If this value is not given it will be calculated based on the scale or tickValues.
     * @exampes [-1, 1]
     */
    domain: React.PropTypes.array,
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: React.PropTypes.number,
    /**
     * The label prop specifies the label for your axis
     */
    label: React.PropTypes.string,
    /**
     * The labelPadding prop specifies the padding in pixels for you axis label
     */
    labelPadding: React.PropTypes.number,
    /**
     * This value describes how far from the "edge" of it's permitted area each axis
     * will be set back in the x-direction.  If this prop is not given,
     * the offset is calculated based on font size, axis orientation, and label padding.
     */
    offsetX: React.PropTypes.number,
    /**
     * This value describes how far from the "edge" of it's permitted area each axis
     * will be set back in the y-direction.  If this prop is not given,
     * the offset is calculated based on font size, axis orientation, and label padding.
     */
    offsetY: React.PropTypes.number,
    /**
     * The orientation prop specifies the position and orientation of your axis.
     */
    orientation: React.PropTypes.oneOf(["top", "bottom", "left", "right"]),
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.shape({
        top: React.PropTypes.number,
        bottom: React.PropTypes.number,
        left: React.PropTypes.number,
        right: React.PropTypes.number
      })
    ]),
    /**
     * The scale prop determines which scales your axis should use. This prop should be
     * given as a function,
     * @exampes d3.time.scale()
     */
    scale: React.PropTypes.func,
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryAxis with other components within an enclosing <svg> tag.
     */
    standalone: React.PropTypes.bool,
    /**
     * The style prop specifies styles for your chart. Victory Axis relies on Radium,
     * so valid Radium style objects should work for this prop, however height, width, and margin
     * are used to calculate range, and need to be expressed as a number of pixels.
     * styles for axis lines, gridlines, and ticks are scoped to separate props.
     * @examples {axis: {stroke: "#756f6a"}, grid: {stroke: "grey"}, ticks: {stroke: "grey"},
     * tickLabels: {fontSize: 10, padding: 5}, axisLabels: {fontSize: 16, padding: 20}}
     */
    style: React.PropTypes.object,
    /**
     * The tickCount prop specifies how many ticks should be drawn on the axis if
     * ticksValues are not explicitly provided.
     */
    tickCount: React.PropTypes.number,
    /**
     * The tickFormat prop specifies how tick values should be expressed visually.
     * tickFormat can be given as a function to be applied to every tickValue, or as
     * an array of display values for each tickValue
     * @examples d3.time.format("%Y"), (x) => x.toPrecision(2), ["first", "second", "third"]
     */
    tickFormat: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.array]),
    /**
     * The tickValues prop explicity specifies which ticks values to draw on the axis.
     * @examples ["apples", "bananas", "oranges"], [2, 4, 6, 8]
     */
    tickValues: React.PropTypes.array,
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: React.PropTypes.number
  };

  static defaultProps = {
    height: 300,
    padding: 30,
    scale: d3.scale.linear(),
    standalone: true,
    tickCount: 5,
    width: 500
  };

  componentWillMount() {
    // If animating, the `VictoryAxis` instance wrapped in `VictoryAnimation`
    // will compute these values.
    if (!this.props.animate) {
      this.getCalculatedValues(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    // If animating, the `VictoryAxis` instance wrapped in `VictoryAnimation`
    // will compute these values.
    if (!this.props.animate) {
      this.getCalculatedValues(nextProps);
    }
  }

  getCalculatedValues(props) {
    // order matters!
    this.style = this.getStyles(props);
    this.padding = this.getPadding(props);
    this.orientation = this.getOrientation(props);
    this.isVertical = this.orientation === "left" || this.orientation === "right";
    this.stringMap = this.createStringMap(props);
    this.range = this.getRange(props);
    this.domain = this.getDomain(props);
    this.scale = this.getScale(props);
    this.ticks = this.getTicks(props);
    this.tickFormat = this.getTickFormat(props);
    this.labelPadding = this.getLabelPadding(props);
    this.offset = this.getOffset(props);
    this.tickProperties = this.getTickProperties(props);
    this.transform = this.getTransform(props);
  }

  getOrientation(props) {
    if (props.orientation) {
      return props.orientation;
    }
    return props.dependentAxis ? "left" : "bottom";
  }

  getStyles(props) {
    const style = props.style || defaultStyles;
    const {axis, grid, ticks, tickLabels, axisLabels, parent} = style;
    return {
      parent: _.merge({height: props.height, width: props.width}, parent),
      axis: _.merge({}, defaultStyles.axis, axis),
      grid: _.merge({}, defaultStyles.grid, grid),
      ticks: _.merge({}, defaultStyles.ticks, ticks),
      tickLabels: _.merge({}, defaultStyles.tickLabels, tickLabels),
      axisLabels: _.merge({}, defaultStyles.axisLabels, axisLabels)
    };
  }

  getPadding(props) {
    const padding = _.isNumber(props.padding) ? props.padding : defaultPadding;
    return {
      top: props.padding.top || padding,
      bottom: props.padding.bottom || padding,
      left: props.padding.left || padding,
      right: props.padding.right || padding
    };
  }

  createStringMap(props) {
    // if tickValues exist and are strings, create a map using only those strings
    // dont alter the order.
    const containsStrings = function (collection) {
      return _.some(collection, function (item) {
        return _.isString(item);
      });
    };

    if (props.tickValues && containsStrings(props.tickValues)) {
      return _.zipObject(_.map(props.tickValues, (tick, index) => {
        return ["" + tick, index + 1];
      }));
    }
  }

  getDomain(props) {
    let domain;
    if (props.domain) {
      domain = props.domain;
    } else if (props.tickValues) {
      domain = this._getDomainFromTickValues(props);
    } else {
      domain = this._getDomainFromScale(props);
    }
    return domain;
  }

  // helper for getDomain()
  _getDomainFromTickValues(props) {
    let domain;
    if (this.stringMap) {
      const values = _.values(this.stringMap);
      domain = [_.min(values), _.max(values)];
    } else {
      const ticks = _.map(props.tickValues, (value) => +value);
      // coerce ticks to numbers
      domain = [_.min(ticks), _.max(ticks)];
    }
    return this.isVertical ? domain.concat().reverse() : domain;
  }

  // helper for getDomain()
  _getDomainFromScale(props) {
    const scaleDomain = props.scale.domain();
    return this.isVertical ? scaleDomain.concat().reverse() : scaleDomain;
  }

  getRange(props) {
    return this.isVertical ?
      [this.padding.top, props.height - this.padding.bottom] :
      [this.padding.left, props.width - this.padding.right];
  }

  getScale(props) {
    const scale = props.scale.copy();
    scale.range(this.range);
    scale.domain(this.domain);
    return scale;
  }

  getTicks(props) {
    let t;
    if (this.stringMap) {
      t = _.values(this.stringMap);
    } else if (props.tickValues) {
      t = props.tickValues;
    } else if (_.isFunction(this.scale.ticks)) {
      const ticks = this.scale.ticks(props.tickCount);
      if (props.crossAxis) {
        t = _.includes(ticks, 0) ? _.without(ticks, 0) : ticks;
      } else {
        t = ticks;
      }
    } else {
      t = this.scale.domain();
    }
    return Array.isArray(t) ? t : [t];
  }

  getTickFormat(props) {
    if (props.tickFormat && _.isFunction(props.tickFormat)) {
      return props.tickFormat;
    } else if (props.tickFormat && _.isArray(props.tickFormat)) {
      return (x, index) => props.tickFormat[index];
    } else if (this.stringMap) {
      const dataNames = _.keys(this.stringMap);
      // string ticks should have one tick of padding
      const dataTicks = ["", ...dataNames];
      return (x) => dataTicks[x];
    } else if (_.isFunction(this.scale.tickFormat())) {
      return this.scale.tickFormat(this.ticks.length);
    } else {
      return (x) => x;
    }
  }

  getLabelPadding(props) {
    if (this.style.axisLabels.padding) {
      return this.style.axisLabels.padding;
    }
    // TODO: magic numbers
    const fontSize = this.style.axisLabels.fontSize;
    return props.label ? (fontSize * 2.4) : 0;
  }

  getOffset(props) {
    const xPadding = props.orientation === "right" ? this.padding.right : this.padding.left;
    const yPadding = props.orientation === "top" ? this.padding.top : this.padding.bottom;
    const fontSize = this.style.axisLabels.fontSize;
    const offsetX = props.offsetX || xPadding;
    const offsetY = props.offsetY || yPadding;
    const totalPadding = fontSize +
      (2 * this.style.ticks.size) +
      this.labelPadding;
    const minimumPadding = 1.2 * fontSize; // TODO: magic numbers
    const x = this.isVertical ? totalPadding : minimumPadding;
    const y = this.isVertical ? minimumPadding : totalPadding;
    return {
      x: offsetX || x,
      y: offsetY || y
    };
  }

  getTickProperties() {
    const tickSpacing = _.max([this.style.ticks.size, 0]) +
      this.style.ticks.padding;
    // determine axis orientation and layout
    const sign = this.orientation === "top" || this.orientation === "left" ? -1 : 1;
    // determine tick formatting constants based on orientationation and layout
    const x = this.isVertical ? sign * tickSpacing : 0;
    const y = this.isVertical ? 0 : sign * tickSpacing;
    const x2 = this.isVertical ? sign * this.style.ticks.size : 0;
    const y2 = this.isVertical ? 0 : sign * this.style.ticks.size;
    let dy;
    let textAnchor;
    if (this.isVertical) {
      dy = ".32em"; // todo: magic numbers from d3
      textAnchor = sign < 0 ? "end" : "start";
    } else {
      dy = sign < 0 ? "0em" : ".71em"; // todo: magic numbers from d3
      textAnchor = "middle";
    }
    return {x, y, x2, y2, dy, textAnchor};
  }

  getTransform(props) {
    const transform = {
      top: [0, this.offset.y],
      bottom: [0, (props.height - this.offset.y)],
      left: [this.offset.x, 0],
      right: [(props.width - this.offset.x), 0]
    };
    return "translate(" + transform[this.orientation][0] + "," +
      transform[this.orientation][1] + ")";
  }

  getAxisLine() {
    const extent = {
      x: [this.padding.left, this.props.width - this.padding.right],
      y: [this.padding.top, this.props.height - this.padding.bottom]
    };
    return this.isVertical ?
      <line y1={_.min(extent.y)} y2={_.max(extent.y)} style={this.style.axis}/> :
      <line x1={_.min(extent.x)} x2={_.max(extent.x)} style={this.style.axis}/>;
  }

  getTickLines() {
    let position;
    let translate;
    let textLength;
    // determine the position and translation of each tick
    return _.map(this.ticks, (tick, index) => {
      position = this.scale(tick);
      translate = this.isVertical ?
        "translate(0, " + position + ")" : "translate(" + position + ", 0)";
      textLength =
        this.getTextHeight(this.tickFormat.call(this, tick, index));
      return (
        <g key={"tick-" + index} transform={translate}>
          <line
            x2={this.tickProperties.x2}
            y2={this.tickProperties.y2}
            style={this.style.ticks}/>
          <text x={this.tickProperties.x}
            y={(this.tickProperties.y - textLength)}
            dy={this.tickProperties.dy}
            style={this.style.tickLabels}
            textAnchor={this.tickProperties.textAnchor}>
            {this.getTextLines(this.tickFormat.call(this, tick, index), this.tickProperties.x)}
          </text>
        </g>
      );
    });
  }

  getGridLines() {
    const xPadding = this.orientation === "right" ? this.padding.right : this.padding.left;
    const yPadding = this.orientation === "top" ? this.padding.top : this.padding.bottom;
    const sign = this.orientation === "top" || this.orientation === "left" ? 1 : -1;
    const xOffset = this.props.crossAxis ? this.offset.x - xPadding : 0;
    const yOffset = this.props.crossAxis ? this.offset.y - yPadding : 0;
    const x2 = this.isVertical ?
      sign * (this.props.width - (this.padding.left + this.padding.right)) : 0;
    const y2 = this.isVertical ?
      0 : sign * (this.props.height - (this.padding.top + this.padding.bottom));
    let position;
    let translate;
    // determine the position and translation of each gridline
    return _.map(this.ticks, (tick, index) => {
      position = this.scale(tick);
      translate = this.isVertical ?
        "translate(" + -xOffset + ", " + position + ")" :
        "translate(" + position + ", " + yOffset + ")";
      return (
        <g key={"grid-" + index} transform={translate}>
          <line
            x2={x2}
            y2={y2}
            style={this.style.grid}/>
        </g>
        );
    });
  }

  getTextLines(text, x) {
    if (!text) {
      return "";
    }
    // TODO: split text to new lines based on font size, number of characters and total width
    // TODO: determine line height ("1.2em") based on font size
    const textString = "" + text;
    const textLines = textString.split("\n");
    return _.map(textLines, (line, index) => {
      return index === 0 ?
      (<tspan x={x} key={"text-line-" + index}>{line}</tspan>) :
      (<tspan x={x} dy="1.2em" key={"text-line-" + index}>{line}</tspan>);
    });
  }

  getTextHeight(text) {
    if (!text) {
      return null;
    }
    const textString = "" + text;
    const textLines = textString.split("\n");
    return this.orientation === "top" ?
     (textLines.length - 1) * this.style.tickLabels.fontSize * 1.25 : 0;
  }

  getLabelElements() {
    if (this.props.label) {
      const orientation = this.orientation;
      const sign = (orientation === "top" || orientation === "left") ? -1 : 1;
      const x = this.isVertical ? -((this.props.height) / 2) : ((this.props.width) / 2);
      return (
        <text
          textAnchor="middle"
          y={sign * this.labelPadding}
          x={x}
          style={this.style.axisLabels}
          transform={this.isVertical ? "rotate(-90)" : ""}>
          {this.getTextLines(this.props.label, x)}
        </text>
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
      const animateData = _.omit(this.props, [
        "orientation", "scale", "tickFormat", "animate",
        "crossAxis", "standalone"
      ]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {props => <VictoryAxis {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    }
    const group = (
      <g style={this.style.parent} transform={this.transform}>
        {this.getGridLines()}
        {this.getAxisLine()}
        {this.getTickLines()}
        {this.getLabelElements()}
      </g>
    );
    return this.props.standalone ? (
      <svg style={this.style.parent}>
        {group}
      </svg>
    ) : group;
  }
}
