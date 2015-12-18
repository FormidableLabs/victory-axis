import React from 'react';
import ReactDOM from 'react-dom';
import Ecology from 'ecology';
import Radium, { Style } from 'radium';
import d3Scale from "d3-scale";
import * as docgen from "react-docgen";

import {VictoryTheme} from 'formidable-landers';

@Radium
class Docs extends React.Component {
  render() {
    return (
      <div>
        <Ecology
          overview={require('!!raw!./ecology.md')}
          source={docgen.parse(require("!!raw!../src/components/victory-axis"))}
          scope={{React, ReactDOM, d3Scale, VictoryAxis: require('../src/components/victory-axis')}}
          playgroundtheme='elegant' />
        <Style rules={VictoryTheme}/>
      </div>
    )
  }
}

export default Docs;
