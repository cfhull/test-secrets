import React from 'react';

class TriggerIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  onClick() {
    this.props.onClick();
  }

  getX() {
    return (
      <>
        <line x1="0" x2="100" y1="0" y2="100" />
        <line x1="0" x2="100" y1="100" y2="0" />
      </>
    );
  }

  getPlus() {
    return (
      <>
        <line x1="0" x2="100" y1="50" y2="50" />
        <line x1="50" x2="50" y1="0" y2="100" />
      </>
    );
  }

  render() {
    let icon;
    let classes = 'trigger-icon ';
    switch (this.props.iconType) {
      case 'remove':
        icon = this.getX();
        classes += 'remove-icon';
      case 'expand':
        icon = this.getPlus();
        classes += 'expand-icon';
      case 'collapse':
        icon = this.getMinus();
        classes += 'collapse-icon';
    }
    return (
      <svg onClick={this.props.onClick} viewBox="0 0 100 100" className={classes}>
        {icon}
      </svg>
    );
  }
}

export default TriggerIcon;
