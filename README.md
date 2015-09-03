[![Travis Status][trav_img]][trav_site]

Victory Axis
=============

Victory axis is an implementation of d3 axis that leaves all of the rendering to React. In addition to the usual d3 features, Victory Axis comes with some default styling, and will also nicely center your axis given a height and width.

## Examples

Victory Axis is written to be highly configurable, but it also includes a set of sensible defaults and fallbacks. If no properties are provided,   

```
 <svg width={500} height={500}>
    <VictoryAxis/>
  </svg>
```

Victory Axis renders the following default axis:

![Default axis](default-axis.png)

Axes are meant to be composble. Axes with the same offsets should line up automatically.  
```
<svg width={500} height={500}>
  <VictoryAxis
    label="x-axis"
    orientation="bottom"
    offsetX={50}
    offsetY={50}/>
  <VictoryAxis
    label="y-axis"
    orientation="left"
    offsetX={50}
    offsetY={50}/>
</svg>
```

Labels are automatically centered along each axis.

![Standard x-y axis](x-y-axis.png)

With a little more code, you can make a time scale with custom tick values and formatting. 

```
<svg width={500} height={500}>
  <VictoryAxis
    scale={() => d3.time.scale()}
    tickValues={[
      new Date(1980, 1, 1),
      new Date(1990, 1, 1),
      new Date(2000, 1, 1),
      new Date(2010, 1, 1),
      new Date(2020, 1, 1)]}
      tickFormat={() => d3.time.format("%Y")}/>
</svg>
```

![Time scale axis](time-scale-axis.png)

~~All~~ Most* other d3 scales are supported too. Here's how you make a log scale:
```
<svg width={500} height={500}>
  <VictoryAxis
    <VictoryAxis
      orientation="left"
      scale={() => d3.scale.log()}
      offsetX={75}
      domain={[1, 5]}/>/>
</svg>
```

![Time scale axis](time-scale-axis.png)

*We're still working on ordinal scales

## API

There are tons of configuration options for Victory Axis. Some map directly to d3, but we've added some new ones too.

### Props

All props are optional for linear scales, but some of the more exotic scales require explicit configuration. Victory Axis will warn you if the axis you select isn't receiving the options it requires. Required props for each scale are also enumerated at the end of this section.

#### scale
This prop determines what scale your axis should use. This prop should return a function. Most d3 scale functions are supported.  
**Default** scale: `() => d3.scale.linear()`
**PropType** func

#### domain
This prop describes the range of *input* values the axis will cover. This prop should be given as an array of the minimum and maximum expected values for your axis. If this prop isn't provided Victory Axis will try to assign a domain based on `tickValues`, or the default domain of the axis scale. Most d3 scales have default domains of `[0, 1]`. Ordinal, quantile, threshold, and time scales need a specified domain or `tickValues`. Identity scales require the domain and range to be identical, so by default, Victory Axis will set the default domain equal to the range when these scales are used.  If you are using an identity scale, and you want to specify a custom domain, you will also need to specify an identical custom range, or the custom domain will be overridden.  
**Default** calculated
**PropType** array

#### range
This prop describes the *output* range of values the axis will cover. By default this prop is calculated based on width, height, offsets, and orientation, so that the axis is sensible within the area allocated for it on the screen. It's reasonable to think of the relationship between Victory Axis domains and ranges as a mapping between the spread of data you want to cover, and the space you have to display it. In most cases, using the default calculated range is a good idea, but if you want to use a custom range, just pass in an array containing the minimum and maximum expected value for the range.  
**Default** calculated
**PropType** array

#### tickValues
`tickValues` expects an array of values.  If this prop is provided, Victory Axis will render each value as a tick on the axis as long as they are within domain specified by `this.props.domain`. If no domain is specified, the minimum and maximum `tickValues` will be used to determine the domain.  
**Default** undefined
**PropType** array

#### tickCount
If a `tickArray` is not specified, `tickCount` will be used to determine how many ticks to render to the axis. Ticks will be evenly spaced across the domain.  
**Default** tickCount: 5
**PropType** number

#### tickFormat
`tickFormat` is a function that will determine how each `tickValue` is formatted. For example, in the case of time scales, `tickFormat` might be specified as:

```
tickFormat={() => d3.time.format("%Y")}
```

Causing each tick to display only years.  By default, `tickFormat` will be set to the default `tickFormat` for whatever axis scale you are using, or

```
(x) => x
```

if no scale is found. This prop will work with d3 formats and arbitrary functions.  
**Default** calculated
**PropType** func

#### label 
That's your axis label.  
**Default** label: ""
**PropType** string

#### orientation 
This props describes how the axis will be positioned. Supported options are "top", "bottom", "left", and "right".  
**Default** orientation: "bottom"
**PropType** "top", "bottom", "left", "right"

#### offsetX
This value describes how far from the "edge" of it's permitted area each axis will be set back in the x-direction.  If this prop is not given, the offset is calculated based on font size, axis orientation, and label padding.  
**Default** calculated
**PropType** number

#### offsetY
This value describes how far from the "edge" of it's permitted area each axis will be set back in the y-direction.  If this prop is not given, the offset is calculated based on font size, axis orientation, and label padding.  
**Default** calculated
**PropType** number

#### labelPadding
This value is how much padding your label should get. If Victory Axis has a label, and this value is not provided, label padding will be calculated based on font size.  
**Default** calculated
**PropType** number

#### style
Victory Axis is styled inline with [Radium](http://github.com/formidablelabs/radium). The default styles are as follows:

```
{
  axis: {
    stroke: "#756f6a",
    fill: "#756f6a",
    strokeWidth: 2,
    strokeLinecap: "round"
  },
  ticksLines: {
    stroke: "#756f6a",
    fill: "#756f6a",
    strokeWidth: 2,
    strokeLinecap: "round"
  },
  gridLines: {
    stroke: "#c9c5bb",
    fill: "#c9c5bb",
    strokeWidth: 1,
    strokeLinecap: "round"
  },
  text: {
    color: "#756f6a",
    fontFamily: "sans-serif"
  }
}
```

Any styles passed in as props will be merged with this set of default styles.  
**Default** See above
**PropType** node

### containerElement

This prop determines whether to render Victory Scatter in a `<g>` or `<svg>` element. It is useful to set this prop to "g" if you are composing Victory Scatter with other victory components.

**PropTypes** "g" or "svg"

**Default** `containerElement: "svg"`

#### animate

This prop determines whether or not to animate transitions as data changes.  Animation is handled by [Victory Animation](https://github.com/FormidableLabs/victory-animation)

**PropTypes** bool

**Default** `animate: false`

**TODO: write detailed descriptions for the following props**
  - showGridLines: React.PropTypes.bool
  - crossAxis: React.PropTypes.bool
  - axisStyle: React.PropTypes.node
  - tickStyle: React.PropTypes.node
  - gridStyle: React.PropTypes.node

### Required Prop Types by Scale

- linear: none
- log: none
- pow: none
- identity: none, but domain and range must be identical if specified
- quantile: domain or tickValues
- quantize: none, but domain is recommended
- threshold: domain or tickValues
- time: domain or tickValues
- ordinal: domain or tickValues, not fully supported.

## Coming Soon!

- Suppport for laying out axes that cross each other
- Better support for ordinal scales
- Better default styles and better methods of overriding these styles, including CUSTOMIZABLE THEMES!
- Test Coverage!

## Development

Please see [DEVELOPMENT](DEVELOPMENT.md)

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md)

[trav_img]: https://api.travis-ci.org/FormidableLabs/victory-axis.svg
[trav_site]: https://travis-ci.org/FormidableLabs/victory-axis

