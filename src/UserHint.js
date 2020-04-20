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

    let dismissTrigger = null;
    if (this.props.onDismiss) {
      dismissTrigger = <TriggerIcon iconType={ICON_TYPE.REMOVE} onClick={this.props.onDismiss} />;
    }
    
    return (
      <div className={classes}>
        {dismissTrigger}
        <div className='content'>{this.props.content}</div>
      </div>
    )
  }
}

export default UserHint;
