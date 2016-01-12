import without from "lodash/array/without";
import includes from "lodash/collection/includes";
import range from "lodash/utility/range";

const getTicks = (props, scale, stringTicks) => {
  if (props.tickValues) {
    // Since we declared that `tickValues` must be a homogenous array, we only
    // need to do a string check on the first item.
    if (stringTicks) {
      return range(1, props.tickValues.length + 1);
    }
    return props.tickValues;
  } else if (scale.ticks && typeof scale.ticks === "function") {
    const ticks = scale.ticks(props.tickCount);
    if (props.crossAxis) {
      return includes(ticks, 0) ? without(ticks, 0) : ticks;
    }
    return ticks;
  }
  return scale.domain();
};

const getTickFormat = (props, tickProps) => {
  const {scale, ticks, stringTicks} = tickProps;
  if (props.tickFormat && typeof props.tickFormat === "function") {
    return props.tickFormat;
  } else if (props.tickFormat && Array.isArray(props.tickFormat)) {
    return (x, index) => props.tickFormat[index];
  } else if (stringTicks) {
    return (x, index) => props.tickValues[index];
  } else if (scale.tickFormat && typeof scale.tickFormat === "function") {
    return scale.tickFormat(ticks.length);
  } else {
    return (x) => x;
  }
};

const getLabelPadding = (props, style, isVertical) => {
  const labelStyle = style.axisLabel;
  if (typeof labelStyle.padding !== "undefined" && labelStyle.padding !== null) {
    return labelStyle.padding;
  }
  // TODO: magic numbers
  return props.label ? (labelStyle.fontSize * (isVertical ? 2.3 : 1.6)) : 0;
};

const getOffset = (props, layoutProps) => {
  const {style, padding, isVertical, labelPadding, orientation} = layoutProps;
  const xPadding = orientation === "right" ? padding.right : padding.left;
  const yPadding = orientation === "top" ? padding.top : padding.bottom;
  const fontSize = style.axisLabel.fontSize;
  const offsetX = props.offsetX || xPadding;
  const offsetY = props.offsetY || yPadding;
  const totalPadding = fontSize + (2 * style.ticks.size) + labelPadding;
  const minimumPadding = 1.2 * fontSize; // TODO: magic numbers
  const x = isVertical ? totalPadding : minimumPadding;
  const y = isVertical ? minimumPadding : totalPadding;
  return {
    x: offsetX || x,
    y: offsetY || y
  };
};

const getTransform = (props, layoutProps) => {
  const {offset, orientation} = layoutProps;
  const translate = {
    top: [0, offset.y],
    bottom: [0, props.height - offset.y],
    left: [offset.x, 0],
    right: [props.width - offset.x, 0]
  }[orientation];
  return `translate(${translate[0]}, ${translate[1]})`;
};

export default { getTransform, getOffset, getLabelPadding, getTickFormat, getTicks };
