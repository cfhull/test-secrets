import React from 'react';

const ICON_TYPE = {
  REMOVE: 'remove',
  EXPAND: 'expand',
  COLLAPSE: 'collapse',
  D_ARROW: 'down-arrow',
  R_ARROW: 'right-arrow'
};

class TriggerIcon extends React.Component {
  constructor(props) {
    super(props)
  }

  onClick() {
    this.props.onClick();
  }

  getRemove() {
    return (
      <>
        <line x1='15' x2='85' y1='15' y2='85'/>
        <line x1='15' x2='85' y1='85' y2='15'/>
      </>
    )    
  }
  
  getExpand() {
    return (
      <>
        <line x1='15' x2='85' y1='50' y2='50'/>
        <line x1='50' x2='50' y1='15' y2='85'/>
      </>
    )    
  }

  getCollapse() {
    return (
      <>
        <line x1='20' x2='80' y1='50' y2='50'/>
      </>
    )    
  }

  getDownArrow() {
    return (
      <>
        <polyline points='50,0 50,100' />
        <polyline points='10,55 50,100 90,55' />
      </>
    )
  }
  
  getBracketWrap(icon) {
    return (
      <>
        <polyline points='15,0 0,0 0,100 15,100' />
          {icon}
        <polyline points='85,0 100,0 100,100 85,100' />
      </>
    )    
  }
  
  render() {
    let icon;
    let classes = 'trigger-icon ';
    let transform = '';
    switch (this.props.iconType) {
      case ICON_TYPE.REMOVE:
        icon = this.getRemove();
        classes += 'remove-icon';
        break;
      case ICON_TYPE.EXPAND:
        icon = this.getExpand();
        classes += 'expand-icon';
        break;
      case ICON_TYPE.COLLAPSE:
        icon = this.getCollapse();
        classes += 'collapse-icon';
        break;
      case ICON_TYPE.D_ARROW:
        icon = this.getDownArrow();
        classes += 'down-arrow';
        break;
      case ICON_TYPE.R_ARROW:
        icon = this.getDownArrow();
        classes += 'right-arrow';
        transform += 'rotate(270)';
        break;
      default:
        console.error('incorrect type');
    }

    if (this.props.inBrackets) {
      classes += ' bracketed';
      icon = this.getBracketWrap(icon);
    }

    return (
      <svg
        onClick={this.props.onClick}
        viewBox='0 0 100 100'
        transform={transform}
        className={classes}
      >
        {icon}
      </svg>
    )
  }
}

export default TriggerIcon;
export { ICON_TYPE };
