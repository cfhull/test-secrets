import React from 'react';
import { MOBILE_BREAKPOINT } from './consts';
import TriggerIcon, { ICON_TYPE } from './TriggerIcon';

class Legend extends React.Component {
  constructor(props) {
    super(props);

    const startExpanded = window.innerWidth > MOBILE_BREAKPOINT;
    this.state = { expanded: startExpanded };

    this.toggleExpand = this.toggleExpand.bind(this);
  }

  toggleExpand() {
    this.setState(state => ({ expanded: !state.expanded }));
  }

  render() {
    const { expanded } = this.state;

    let classes = 'legend';
    if (!expanded) {
      classes += ' hidden';
    }

    const title = expanded ? 'Hide Legend' : 'Show Legend';

    const iconType = expanded ? ICON_TYPE.XCLOSE : ICON_TYPE.LEGEND;
    return (
      <div className={classes}>
          <TriggerIcon title={title} onClick={this.toggleExpand} iconType={iconType} />
          <div className='content'>
            <div><i className='concluded' />Concluded Experiments</div>
            <div><i className='active' />Active Experiments</div>
          </div>
          {this.props.lastUpdate ?
            <div className="last-updated">
              Data current through {this.props.lastUpdate}
            </div>
          : null}
      </div>
    )
  }
}

export default Legend;
