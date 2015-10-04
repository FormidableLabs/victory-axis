import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";
import log from "../log";
import {VictoryAnimation} from "victory-animation";

class VAxis extends React.Component {

  constructor(props) {
    super(props);
  }

  getStyles() {
    return _.merge({
      width: 500,
      height: 300,
      margin: 20,
      fontFamily: "Helvetica",
      fontSize: 15
    }, this.props.style);
  }

  getDomain() {
    if (this.props.domain) {
      return this.props.domain;
    } else if (this.props.tickValues) {
      return this._getDomainFromTickValues();
    } else {
      return this._getDomainFromScale();
    }
  }

  // helper for getDomain()
  _getDomainFromTickValues() {
    // coerce ticks to numbers
    const ticks = _.map(this.props.tickValues, (value) => +value);
    const domain = [_.min(ticks), _.max(ticks)];
    return this.isVertical() ? domain.concat().reverse() : domain;
  }

  // helper for getDomain()
  _getDomainFromScale() {
    const scaleDomain = this.props.scale().domain();
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
    return this.isVertical() ? scaleDomain.concat().reverse() : scaleDomain;
  }

  getRange() {
    if (this.props.range) {
      return this.props.range;
    }
    const style = this.getStyles();
    return this.isVertical() ?
      [style.margin, style.height - style.margin] :
      [style.margin, style.width - style.margin];
  }

  isVertical() {
    return (this.props.orientation === "left" || this.props.orientation === "right");
  }

  getFontSize() {
    return this.getStyles().fontSize || 16;
  }

  getLabelPadding() {
    if (this.props.labelPadding) {
      return this.props.labelPadding;
    }
    // TODO: magic numbers
    return this.props.label ? (this.getFontSize() * 2.4) : 0;
  }

  getOffset() {
    const style = this.getStyles();
    const offsetX = this.props.offsetX || style.margin;
    const offsetY = this.props.offsetY || style.margin;
    const fontSize = this.getFontSize();
    const totalPadding = fontSize +
      (2 * this.props.tickStyle.size) +
      this.getLabelPadding();
    const minimumPadding = 1.2 * fontSize; // TODO: magic numbers
    const x = this.isVertical() ? totalPadding : minimumPadding;
    const y = this.isVertical() ? minimumPadding : totalPadding;
    return {
      x: offsetX || x,
      y: offsetY || y
    };
  }

  getTransform() {
    const orientation = this.props.orientation;
    const offset = this.getOffset();
    const style = this.getStyles();
    const transform = {
      top: [0, offset.y],
      bottom: [0, (style.height - offset.y)],
      left: [offset.x, 0],
      right: [(style.width - offset.x), 0]
    };
    return "translate(" + transform[orientation][0] + "," + transform[orientation][1] + ")";
  }

  getScale() {
    const scale = this.props.scale().copy();
    const range = this.getRange();
    const domain = this.getDomain();
    scale.range(range);
    scale.domain(domain);
    // hacky check for identity scale
    if (_.difference(scale.range(), range).length !== 0) {
      // identity scale, reset the domain and range
      scale.range(range);
      scale.domain(range);
      log.warn("Identity Scale: domain and range must be identical. " +
        "Domain has been reset to match range.");
    }
    return scale;
  }

  getTicks() {
    const scale = this.getScale();
    if (this.props.tickValues) {
      return this.props.tickValues;
    } else if (_.isFunction(scale.ticks)) {
      const ticks = scale.ticks(this.props.tickCount);
      if (this.props.crossAxis) {
        return _.includes(ticks, 0) ? _.without(ticks, 0) :
          _.without(ticks, _.min(ticks));
      } else {
        return ticks;
      }
    } else {
      return scale.domain();
    }
  }

  getTickFormat() {
    const scale = this.getScale();
    if (this.props.tickFormat) {
      return this.props.tickFormat;
    } else if (_.isFunction(scale.tickFormat)) {
      return scale.tickFormat(this.getTicks().length);
    } else {
      return (x) => x;
    }
  }

  getAxisLine() {
    const style = this.getStyles();
    const extent = {
      x: [style.margin, style.width - style.margin],
      y: [style.margin, style.height - style.margin]
    };
    return this.isVertical() ?
      <line y1={_.min(extent.y)} y2={_.max(extent.y)} style={this.props.axisStyle}/> :
      <line x1={_.min(extent.x)} x2={_.max(extent.x)} style={this.props.axisStyle}/>;
  }

  getActiveScale(tick) {
    const scale = this.getScale();
    if (scale.rangeBand) {
      return scale(tick) + scale.rangeBand() / 2;
    }
    return scale(tick);
  }

  getTickProperties() {
    const verticalAxis = this.isVertical();
    const tickSpacing = _.max([this.props.tickStyle.size, 0]) +
      this.props.tickStyle.padding;
    // determine axis orientation and layout
    const sign = this.props.orientation === "top" || this.props.orientation === "left" ? -1 : 1;
    // determine tick formatting constants based on orientationation and layout
    const x = verticalAxis ? sign * tickSpacing : 0;
    const y = verticalAxis ? 0 : sign * tickSpacing;
    const x2 = verticalAxis ? sign * this.props.tickStyle.size : 0;
    const y2 = verticalAxis ? 0 : sign * this.props.tickStyle.size;
    let dy;
    let textAnchor;
    if (verticalAxis) {
      dy = ".32em"; // code smell: magic numbers from d3
      textAnchor = sign < 0 ? "end" : "start";
    } else {
      dy = sign < 0 ? "0em" : ".71em"; // code smell: magic numbers from d3
      textAnchor = "middle";
    }
    return {x, y, x2, y2, dy, textAnchor};
  }


  getTickLines() {
    const verticalAxis = this.isVertical();
    const ticks = this.getTicks();
    const properties = this.getTickProperties();
    const style = this.getStyles();
    let position;
    let translate;
    // determine the position and translation of each tick
    return _.map(ticks, (tick, index) => {
      position = this.getActiveScale(tick);
      translate = verticalAxis ?
        "translate(0, " + position + ")" : "translate(" + position + ", 0)";
      return (
        <g key={"tick-" + index} transform={translate}>
          <line
            x2={properties.x2}
            y2={properties.y2}
            style={this.props.tickStyle}/>
          <text x={properties.x}
            y={properties.y}
            dy={properties.dy}
            style={style}
            textAnchor={properties.textAnchor}>
            {this.getTickFormat().call(this, tick)}
          </text>
        </g>
      );
    });
  }

  getGridLines() {
    const style = this.getStyles();
    if (this.props.showGridLines) {
      const sign = this.props.orientation === "top" || this.props.orientation === "left" ? 1 : -1;
      const verticalAxis = this.isVertical();
      const ticks = this.getTicks();
      const offset = this.getOffset();
      const xOffset = this.props.crossAxis ? offset.x - style.margin : 0;
      const yOffset = this.props.crossAxis ? offset.y - style.margin : 0;
      const x2 = verticalAxis ? sign * (style.width - (2 * style.margin)) : 0;
      const y2 = verticalAxis ? 0 : sign * (style.height - (2 * style.margin));
      let position;
      let translate;
      // determine the position and translation of each gridline
      return _.map(ticks, (tick, index) => {
        position = this.getActiveScale(tick);
        translate = verticalAxis ?
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
    const style = this.getStyles();
    const orientation = this.props.orientation;
    const sign = (orientation === "top" || orientation === "left") ? -1 : 1;
    const x = this.isVertical() ? -((style.height) / 2) : ((style.width) / 2);
    if (this.props.label) {
      return (
        <text
          textAnchor="middle"
          y={sign * this.getLabelPadding()}
          x={x}
          style={style}
          transform={this.isVertical() ? "rotate(-90)" : ""}>
          {this.props.label}
        </text>
      );
    } else {
      return <text/>
    }
  }

  render() {
    if (this.props.containerElement === "svg") {
      return (
        <svg style={this.getStyles()}>
          <g style={this.getStyles()} transform={this.getTransform()}>
            {this.getGridLines()}
            {this.getAxisLine()}
            {this.getTickLines()}
            {this.getLabelElements()}
          </g>
        </svg>
      );
    }
    return (
      <g style={this.getStyles()} transform={this.getTransform()}>
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
  constructor(props) {
    super(props);
  }

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
