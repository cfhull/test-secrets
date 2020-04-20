import React from 'react';

const ICON_TYPE = {
  REMOVE: 'remove',
  EXPAND: 'expand',
  COLLAPSE: 'collapse',
  D_ARROW: 'down-arrow',
  R_ARROW: 'right-arrow',
  INFO_ICON: 'info-icon'
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

  getInfoIcon() {
    return (
      <>
        <path d="m128 22.158a105.84 105.84 0 0 0 -105.84 105.84 105.84 105.84 0 0 0 105.84 105.84 105.84 105.84 0 0 0 105.84 -105.84 105.84 105.84 0 0 0 -105.84 -105.84zm0 32.76c5.16 0.117 9.55 1.875 13.18 5.273 3.34 3.575 5.07 7.94 5.19 13.096-0.12 5.156-1.85 9.404-5.19 12.744-3.63 3.75-8.02 5.625-13.18 5.625s-9.4-1.875-12.74-5.625c-3.75-3.34-5.63-7.588-5.63-12.744s1.88-9.521 5.63-13.096c3.34-3.398 7.58-5.156 12.74-5.273zm-16.35 53.792h32.79v92.37h-32.79v-92.37z" fill-rule="evenodd" fill="#72a7cf"/>
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
    let viewBox = '0 0 100 100';
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
      case ICON_TYPE.INFO_ICON:
        icon = this.getInfoIcon();
        classes += 'info-icon';
        viewBox = '0 0 256 256'
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
        viewBox={viewBox}
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
