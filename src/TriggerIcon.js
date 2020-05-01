import React from 'react';

const ICON_TYPE = {
  REMOVE: 'remove',
  EXPAND: 'expand',
  COLLAPSE: 'collapse',
  D_ARROW: 'down-arrow',
  NEW_DOWN_ARROW: 'new-down-arrow',
  NEW_RIGHT_ARROW: 'new-right-arrow',
  D_ARROW_STEMLESS: 'down-arrow-stemless',
  U_ARROW: 'up-arrow',
  U_ARROW_STEMLESS: 'up-arrow-stemless',
  R_ARROW: 'right-arrow',
  R_ARROW_STEMLESS: 'right-arrow-stemless',
  L_ARROW: 'left-arrow',
  L_ARROW_STEMLESS: 'left-arrow-stemless',
  INFO_ICON: 'info-icon',
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

  getDownArrow(stemless) {
    return (
      <>
        {!stemless && <polyline points='50,0 50,100' />}
        
        <line x1="6.0098" y1="0.696815" x2="0.352949" y2="6.35367" stroke="#373737"/>
        <line x1="6.00973" y1="11.3033" x2="0.352874" y2="5.64641" stroke="#373737"/>
      </>
    )
  }
  getNewDownArrow() {
    return (
      <>
        <path d="M1 5.5H10"  stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path fill="none" d="M5.5 1L10 5.5L5.5 10"  stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
    let viewBox = '0 0 12 12';
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
      case ICON_TYPE.D_ARROW_STEMLESS:
        icon = this.getDownArrow(true);
        classes += 'down-arrow stemless';
        break;
      case ICON_TYPE.U_ARROW:
        icon = this.getDownArrow();
        classes += 'up-arrow';
        transform += 'rotate(180)';
        break;
      case ICON_TYPE.U_ARROW_STEMLESS:
        icon = this.getDownArrow(true);
        classes += 'up-arrow stemless';
        transform += 'rotate(180)';
        break;
      case ICON_TYPE.R_ARROW:
        icon = this.getDownArrow();
        classes += 'right-arrow';
        transform += 'rotate(270)';
        break;
      case ICON_TYPE.R_ARROW_STEMLESS:
        icon = this.getDownArrow(true);
        classes += 'right-arrow stemless';
        transform += 'rotate(180)';
        break;
      case ICON_TYPE.L_ARROW:
        icon = this.getDownArrow();
        classes += 'left-arrow';
        transform += 'rotate(90)';
        break;
      case ICON_TYPE.L_ARROW_STEMLESS:
        icon = this.getDownArrow(true);
        classes += 'left-arrow stemless';
        transform += 'rotate(0)';
        break;
      case ICON_TYPE.INFO_ICON:
        icon = this.getInfoIcon();
        classes += 'info-icon';
        viewBox = '0 0 27 27'
        break;
      case ICON_TYPE.NEW_DOWN_ARROW:
        icon = this.getNewDownArrow(true);
        classes += 'new-down-arrow';
        transform += 'rotate(90)';
        viewBox = '0 0 11 11'
        break; 
      case ICON_TYPE.NEW_RIGHT_ARROW:
        icon = this.getNewDownArrow(true);
        classes += 'new-right-arrow';
        transform += 'rotate(0)';
        viewBox = '0 0 11 11'
        break;  
      case ICON_TYPE.XCLOSE:
        icon = this.getXClose(true);
        classes += 'x-close remove-icon';
        viewBox = "0 0 22 22"
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
          {this.props.title && <title>{this.props.title}</title>}
          {icon}
        </svg>
    )
  }
}

export default TriggerIcon;
export { ICON_TYPE };
