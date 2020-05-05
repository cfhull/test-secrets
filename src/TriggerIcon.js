import React from 'react';

const ICON_TYPE = {
  REMOVE: 'remove',
  EXPAND: 'expand',
  COLLAPSE: 'collapse',
  D_ARROW: 'down-arrow',
  D_ARROW_STEMLESS: 'down-arrow-stemless',
  U_ARROW: 'up-arrow',
  U_ARROW_STEMLESS: 'up-arrow-stemless',
  R_ARROW: 'right-arrow',
  R_ARROW_STEMLESS: 'right-arrow-stemless',
  L_ARROW: 'left-arrow',
  L_ARROW_STEMLESS: 'left-arrow-stemless',
  INFO_ICON: 'info-icon',
  LEGEND: 'legend',
  XCLOSE: 'x-close'
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

  // right arrow is our "base" arrow. all arrows are right arrows, then get rotated by CSS transform
  getRightArrow(stemless) {
    return (
      <>
        {!stemless && <path d="M1 5.5H10" stroke-linecap="round" stroke-linejoin="round"/>}
        <path fill="none" d="M5.5 1L10 5.5L5.5 10" stroke-linecap="round" stroke-linejoin="round"/>
      </>
    )
  }

  getXClose() {
    return (
      <>
        <line x1="5.30326" y1="5.30318" x2="15.9099" y2="15.9098" stroke=""/>
        <line x1="15.9097" y1="5.30326" x2="5.30311" y2="15.9099" stroke=""/>
      </>  
    )
  }

  getInfoIcon() {
    return (
      <>
        <circle cx="13.5" cy="13.5" r="13.5" fill="#DBEDF2"/>
        <circle cx="13.5" cy="7.5" r="1.5" fill="#709FAC"/>
        <rect x="12" y="11" width="3" height="10" rx="1.5" fill="#709FAC"/>
      </>
    )
  }

  getLegend() {
    return (
      <>
        <path d="M1 1L4.33334 2.01389V9.11111L1 8.09722V1Z" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7.66602 1L10.9994 2.01389V9.11111L7.66602 8.09722V1Z" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.33398 2.01389L7.66733 1V8.09722L4.33398 9.11111V2.01389Z" stroke-linecap="round" stroke-linejoin="round"/>
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
        icon = this.getRightArrow();
        classes += 'down arrow';
        viewBox = '0 0 11 11';
        break;
      case ICON_TYPE.D_ARROW_STEMLESS:
        icon = this.getRightArrow(true);
        classes += 'down arrow stemless';
        viewBox = '0 0 11 11';
        break;
      case ICON_TYPE.U_ARROW:
        icon = this.getRightArrow();
        classes += 'up arrow';
        viewBox = '0 0 11 11';
        break;
      case ICON_TYPE.U_ARROW_STEMLESS:
        icon = this.getRightArrow(true);
        classes += 'up arrow stemless';
        viewBox = '0 0 11 11';
        break;
      case ICON_TYPE.R_ARROW:
        icon = this.getRightArrow();
        classes += 'right arrow';
        viewBox = '0 0 11 11';
        break;
      case ICON_TYPE.R_ARROW_STEMLESS:
        icon = this.getRightArrow(true);
        classes += 'right arrow stemless';
        viewBox = '0 0 11 11'
        break;
      case ICON_TYPE.L_ARROW:
        icon = this.getRightArrow();
        classes += 'left arrow';
        viewBox = '0 0 11 11';
        break;
      case ICON_TYPE.L_ARROW_STEMLESS:
        icon = this.getRightArrow(true);
        classes += 'left arrow stemless';
        viewBox = '0 0 11 11'
        break;
      case ICON_TYPE.INFO_ICON:
        icon = this.getInfoIcon();
        classes += 'info-icon';
        viewBox = '0 0 27 27'
        break;
      case ICON_TYPE.LEGEND:
        icon = this.getLegend();
        classes += 'legend';
        viewBox = '-1 0 15 10';
        break;
      case ICON_TYPE.XCLOSE:
        icon = this.getXClose(true);
        classes += 'x-close remove-icon';
        viewBox = "0 0 22 22"
        break;  
      default:
        console.error('incorrect type: ', this.props.iconType);
    }

    if (this.props.inBrackets) {
      classes += ' bracketed';
      icon = this.getBracketWrap(icon);
    }

    return (
        <svg
          onClick={this.props.onClick}
          viewBox={viewBox}
          className={classes}
        >
          {this.props.title && <title>{this.props.title}</title>}
          {icon}
        </svg>
    )
  }
}

export default TriggerIcon;
export { ICON_TYPE };
