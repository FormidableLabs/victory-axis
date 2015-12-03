import React from 'react';
import ReactDOM from 'react-dom';
import Ecology from 'ecology';
import Radium, { Style } from 'radium';

import {VictoryTheme} from 'formidable-landers';

@Radium
class Docs extends React.Component {
  render() {
    return (
      <div>
        <Ecology
          overview={require('!!raw!./ecology.md')}
          source={require('json!./victory-axis.json')}
          scope={{React, ReactDOM, VictoryAxis: require('../src/components/victory-axis')}}
          playgroundtheme='elegant' />
        <Style rules={VictoryTheme}/>
      </div>
    )
  }
}

export default Docs;
