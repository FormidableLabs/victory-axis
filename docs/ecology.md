Victory Axis
=============

`victory-axis` draws an SVG chart axis with [React](https://github.com/facebook/react). Styles and data can be customized by passing in your own values as properties to the component. Data changes are animated with [victory-animation](https://github.com/FormidableLabs/victory-animation).

## Examples

Victory Axis is written to be highly configurable, but it also includes a set of sensible defaults and fallbacks. If no properties are provided,   

```playground
 <svg width={500} height={500}>
    <VictoryAxis/>
  </svg>
```

Axes are meant to be composble. Axes with the same offsets should line up automatically.  

```playground
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

Here's how you make a log scale:

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