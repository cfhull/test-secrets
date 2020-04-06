import React from 'react';
import TriggerIcon, { ICON_TYPE } from './TriggerIcon';

class UserHint extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let classes = 'user-hint';
    if (this.props.classes) {
      classes += ` ${this.props.classes}`;
    }
    if (this.props.dismissed) {
      classes += ' dismissed';
    }
    
    return (
      <div className={classes}>
        <div className='content'>{this.props.content}</div>
      </div>
    )
  }
}

export default UserHint;
