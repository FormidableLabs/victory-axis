import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";
import log from "../log";
import {VictoryAnimation} from "victory-animation";

class VAxis extends React.Component {
  constructor(props) {
    super(props);
    this.getCalculatedValues(props);
  }

  componentWillReceiveProps(nextProps) {
    this.getCalculatedValues(nextProps);
  }

  getCalculatedValues(props) {
    // order matters!
    this.style = this.getStyles(props);
    this.isVertical = props.orientation === "left" || props.orientation === "right";
    this.fontSize = this.style.fontSize || 16;
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

  getStyles(props) {
    return _.merge({
      width: 500,
      height: 300,
      margin: 20,
      fontFamily: "Helvetica",
      fontSize: 15
    }, props.style);
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
    const scaleDomain = props.scale().domain();
    // Warn when domains need more information to produce meaningful axes
    if (_.isDate(scaleDomain[0])) {
      log.warn("please specify tickValues or domain when creating a time scale axis");
    } else if (scaleDomain.length === 0) {
      log.warn("please specify tickValues or domain when creating an axis using " +
        "ordinal or quantile scales");
    } else if (scaleDomain.length === 1) {
      log.warn("please specify tickValues or domain when creating an axis using " +
        "a threshold scale");
    }
    return this.isVertical ? scaleDomain.concat().reverse() : scaleDomain;
  }

  getRange(props) {
    if (props.range) {
      return props.range;
    }
    return this.isVertical ?
      [this.style.margin, this.style.height - this.style.margin] :
      [this.style.margin, this.style.width - this.style.margin];
  }

  getScale(props) {
    const scale = props.scale().copy();
    scale.range(this.range);
    scale.domain(this.domain);
    // hacky check for identity scale
    if (_.difference(scale.range(), this.range).length !== 0) {
      // identity scale, reset the domain and range
      scale.range(this.range);
      scale.domain(this.range);
      log.warn("Identity Scale: domain and range must be identical. " +
        "Domain has been reset to match range.");
    }
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
    return _.isArray(t) ? t : [t];
  }

  getTickFormat(props) {
    if (props.tickFormat) {
      return props.tickFormat;
    } else if (this.stringMap) {
      const dataNames = _.keys(this.stringMap);
      // string ticks should have one tick of padding on either side
      const dataTicks = ["", ...dataNames, ""];
      return (x) => dataTicks[x];
    } else if (_.isFunction(this.scale.tickFormat)) {
      return this.scale.tickFormat(this.ticks.length);
    } else {
      return (x) => x;
    }
  }

  getLabelPadding(props) {
    if (props.labelPadding) {
      return props.labelPadding;
    }
    // TODO: magic numbers
    return props.label ? (this.fontSize * 2.4) : 0;
  }

  getOffset(props) {
    const offsetX = props.offsetX || this.style.margin;
    const offsetY = props.offsetY || this.style.margin;
    const totalPadding = this.fontSize +
      (2 * props.tickStyle.size) +
      this.labelPadding;
    const minimumPadding = 1.2 * this.fontSize; // TODO: magic numbers
    const x = this.isVertical ? totalPadding : minimumPadding;
    const y = this.isVertical ? minimumPadding : totalPadding;
    return {
      x: offsetX || x,
      y: offsetY || y
    };
  }

  getTickProperties(props) {
    const tickSpacing = _.max([props.tickStyle.size, 0]) +
      props.tickStyle.padding;
    // determine axis orientation and layout
    const sign = props.orientation === "top" || props.orientation === "left" ? -1 : 1;
    // determine tick formatting constants based on orientationation and layout
    const x = this.isVertical ? sign * tickSpacing : 0;
    const y = this.isVertical ? 0 : sign * tickSpacing;
    const x2 = this.isVertical ? sign * props.tickStyle.size : 0;
    const y2 = this.isVertical ? 0 : sign * props.tickStyle.size;
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
      bottom: [0, (this.style.height - this.offset.y)],
      left: [this.offset.x, 0],
      right: [(this.style.width - this.offset.x), 0]
    };
    return "translate(" + transform[props.orientation][0] + "," +
      transform[props.orientation][1] + ")";
  }

  getAxisLine() {
    const extent = {
      x: [this.style.margin, this.style.width - this.style.margin],
      y: [this.style.margin, this.style.height - this.style.margin]
    };
    return this.isVertical ?
      <line y1={_.min(extent.y)} y2={_.max(extent.y)} style={this.props.axisStyle}/> :
      <line x1={_.min(extent.x)} x2={_.max(extent.x)} style={this.props.axisStyle}/>;
  }

  getTickLines() {
    let position;
    let translate;
    // determine the position and translation of each tick
    return _.map(this.ticks, (tick, index) => {
      position = this.scale(tick);
      translate = this.isVertical ?
        "translate(0, " + position + ")" : "translate(" + position + ", 0)";
      return (
        <g key={"tick-" + index} transform={translate}>
          <line
            x2={this.tickProperties.x2}
            y2={this.tickProperties.y2}
            style={this.props.tickStyle}/>
          <text x={this.tickProperties.x}
            y={this.tickProperties.y}
            dy={this.tickProperties.dy}
            style={this.style}
            textAnchor={this.tickProperties.textAnchor}>
            {this.tickFormat.call(this, tick)}
          </text>
        </g>
      );
    });
  }

  getGridLines() {
    if (this.props.showGridLines) {
      const sign = this.props.orientation === "top" || this.props.orientation === "left" ? 1 : -1;
      const xOffset = this.props.crossAxis ? this.offset.x - this.style.margin : 0;
      const yOffset = this.props.crossAxis ? this.offset.y - this.style.margin : 0;
      const x2 = this.isVertical ? sign * (this.style.width - (2 * this.style.margin)) : 0;
      const y2 = this.isVertical ? 0 : sign * (this.style.height - (2 * this.style.margin));
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
              style={this.props.gridStyle}/>
          </g>
          );
      });
    }
  }

  getLabelElements() {
    const orientation = this.props.orientation;
    const sign = (orientation === "top" || orientation === "left") ? -1 : 1;
    const x = this.isVertical ? -((this.style.height) / 2) : ((this.style.width) / 2);
    if (this.props.label) {
      return (
        <text
          textAnchor="middle"
          y={sign * this.labelPadding}
          x={x}
          style={this.style}
          transform={this.isVertical ? "rotate(-90)" : ""}>
          {this.props.label}
        </text>
      );
    } else {
      return <text/>;
    }
  }

  render() {
    if (this.props.containerElement === "svg") {
      return (
        <svg style={this.style}>
          <g style={this.style} transform={this.transform}>
            {this.getGridLines()}
            {this.getAxisLine()}
            {this.getTickLines()}
            {this.getLabelElements()}
          </g>
        </svg>
      );
    }
    return (
      <g style={this.style} transform={this.transform}>
        {this.getGridLines()}
        {this.getAxisLine()}
        {this.getTickLines()}
        {this.getLabelElements()}
      </g>
    );
  }
}

@Radium
class VictoryAxis extends React.Component {
  render() {
    if (this.props.animate) {
      return (
        <VictoryAnimation data={this.props}>
          {(props) => {
            return (
              <VAxis
                {...props}
                orientation={this.props.orientation}
                scale={this.props.scale}
                tickFormat={this.props.tickFormat}
                showGridLines={this.props.showGridLines}
                animate={this.props.animate}
                crossAxis={this.props.crossAxis}
                containerElement={this.props.containerElement}/>
            );
          }}
        </VictoryAnimation>
      );
    }
    return (<VAxis {...this.props}/>);
  }
}

const propTypes = {
  style: React.PropTypes.node,
  domain: React.PropTypes.array,
  range: React.PropTypes.arrayOf(React.PropTypes.number),
  orientation: React.PropTypes.oneOf(["top", "bottom", "left", "right"]),
  scale: React.PropTypes.func, // is this right, or should we pass a string?
  tickCount: React.PropTypes.number,
  tickValues: React.PropTypes.array,
  tickFormat: React.PropTypes.func,
  label: React.PropTypes.string,
  labelPadding: React.PropTypes.number,
  offsetX: React.PropTypes.number,
  offsetY: React.PropTypes.number,
  showGridLines: React.PropTypes.bool,
  crossAxis: React.PropTypes.bool,
  containerElement: React.PropTypes.oneOf(["svg", "g"]),
  animate: React.PropTypes.bool,
  axisStyle: React.PropTypes.node,
  tickStyle: React.PropTypes.node,
  gridStyle: React.PropTypes.node
};

const defaultProps = {
  orientation: "bottom",
  scale: () => d3.scale.linear(),
  tickCount: 5,
  showGridLines: false,
  containerElement: "svg",
  animate: false,
  axisStyle: {
    stroke: "#756f6a",
    fill: "#756f6a",
    strokeWidth: 2,
    strokeLinecap: "round"
  },
  tickStyle: {
    stroke: "#756f6a",
    fill: "#756f6a",
    strokeWidth: 2,
    strokeLinecap: "round",
    color: "#756f6a",
    fontFamily: "sans-serif",
    size: 4,
    padding: 5
  },
  gridStyle: {
    stroke: "#c9c5bb",
    fill: "#c9c5bb",
    strokeWidth: 1,
    strokeLinecap: "round"
  }
};

VictoryAxis.propTypes = propTypes;
VictoryAxis.defaultProps = defaultProps;
VAxis.propTypes = propTypes;
VAxis.defaultProps = defaultProps;

export default VictoryAxis;
