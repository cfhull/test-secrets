import React from 'react';
import _ from 'lodash';
import TriggerIcon, { ICON_TYPE } from './TriggerIcon';
import { SHEET_FIELDS, ORDERED_CARD_FIELDS, COMPOSITE_FIELDS, LINK_FIELD_PAIRS } from './fields';
import UserHint from './UserHint';

const { LOCATION, NAME, EID, TYPE, WEBSITE } = SHEET_FIELDS;

// pure component? (shallow compare map features?) (perf)
class CardDock extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      minimized: true,
      expandedProperties: {},
      scrollHintDismissed: false    
    };

    this.removeCard = this.removeCard.bind(this);
    this.slideDock = this.slideDock.bind(this);
    this.toggleDock = this.toggleDock.bind(this);
    this.maximizeDock = this.maximizeDock.bind(this);
    this.toggleProperty = this.toggleProperty.bind(this);
  }

  removeCard(id) {
    this.props.removeCard(id);
  }

  slideDock(e) {
    if (e.deltaY && e.deltaY > 0) {
      this.setState({ minimized: false, scrollHintDismissed: true });
    }
  }

  toggleDock() {
    // TODO: call toggle? or remove, make only scroll-controlled
    this.setState(state => ({ minimized: !this.state.minimized }));
  }

  maximizeDock() {
    // TODO: call toggle? or remove, make only scroll-controlled
    this.setState(state => ({ minimized: false }));
  }

  toggleProperty(property, expanded) {
    const expandedProperties = {...this.state.expandedProperties};
    expandedProperties[property] = !expanded;
    this.setState({ expandedProperties });
  }

  getNames() {
    // TODO: don't bind in render (perf)
    return this.props.cardData.map(experimentCardSet => {
      const {
        [EID.sheetId]: eid,
        [NAME.sheetId]: name,
        [TYPE.sheetId]: type
      } = experimentCardSet[0];
      const classes = 'name ' + type;
      return (
        <td key={'name'+eid} className={classes}>
          {name||'(none)'}
          <TriggerIcon iconType={ICON_TYPE.REMOVE} onClick={this.removeCard.bind(this, eid)} />
        </td>
    )});
  }

  getRows() {
    return ORDERED_CARD_FIELDS.map(field => {
      const { displayName, sheetId, isFeatureHeader } = field;

      const expandible = this.getIsExpandible(field);

      const expanded = !!this.state.expandedProperties[field.sheetId];

      let expandIcon = null;
      if (expandible) {
        // TODO: also don't bind in render (perf)
        const iconType = expanded ? ICON_TYPE.COLLAPSE : ICON_TYPE.EXPAND;
        expandIcon = (
          <TriggerIcon
            onClick={this.toggleProperty.bind(this, field.sheetId, expanded)}
            iconType={iconType}
          />
        );
      }

      let cellClass = 'property-cell';
      if (expandible) {
        cellClass += ' expandible';
      }
      if (isFeatureHeader) {
        cellClass += ' feature-header';
      }

      let valueClass = 'property-value';
      if (expanded) {
        valueClass += ' expanded';
      }

      const propertyCells = this.props.cardData.map(experimentCardSet => {

        const cellContent = this.getCellContent(experimentCardSet, field);
        const { [EID.sheetId]: eid } = experimentCardSet[0];
        return (
          <td className={cellClass} key={displayName+'-td-'+eid}>
            <div className='property-name'>{displayName}{expandIcon}</div>
            <div className={valueClass}>{cellContent}</div>
          </td>
      )});
      return <tr className='property-row' key={displayName}>{propertyCells}</tr>;
    });
  }

  getIsExpandible(field) {
    // 1) not expandible => F 2) has multiple locations w/diff values => T 3) sole value > 40Ms
    if (field === LOCATION) {
      // if any experimint in the card dock has multiple locations, the cell should be expandible
      return _.some(this.props.cardData, expCardSet => expCardSet.length > 1);
    }
    return field.isExpandible;
  }

  getCellContent(experimentCardSet, field) {
    if (field === LOCATION) {
      return this.getLocationCellContent(experimentCardSet);
    } else if (field.isFeatureHeader) {
      return null;
    } else if (field === COMPOSITE_FIELDS.RELATED_RESOURCES) {
      return this.getLinksContent(experimentCardSet);
    }

    const { sheetId } = field;
    const [locationOneData, ...otherLocationsData] = experimentCardSet;
    const firstValue = locationOneData[sheetId];
    const uniformValue = field.forceUniformValue || _.every(otherLocationsData, l => l[sheetId] === firstValue);

    let cellContent;
    if (field === WEBSITE && firstValue.includes('.')) {
      cellContent = <a href={firstValue} target="_blank">{firstValue}</a>;
    } else if (uniformValue) {
      cellContent = firstValue;
    } else {
      // break cell into block for each location, as they have different values
      cellContent = experimentCardSet.map(locationData => {
        const {
          [EID.sheetId]: eid,
          [LOCATION.sheetId]: location,
        } = locationData;
        return (
          <div key={`cell-content-${sheetId}-${eid}-${location}`}>
            <div
              title={location}
              className='property-location-title'
            >
              {location}
            </div>
            {locationData[sheetId]}
          </div>
        )
      })
    }

    return <>{cellContent}</>;
  }

  getLocationCellContent(experimentCardSet) {
    const cellContent = experimentCardSet.map(locationData => {
      const {
        [EID.sheetId]: eid,
        [LOCATION.sheetId]: location,
      } = locationData;
      return (
        <div
          title={location}
          className='location-cell-content'
          key={`cell-content-location-${eid}-${location}`}
        >
          {location}
        </div>
    )});
    return <>{cellContent}</>;
  }

  getLinksContent(experimentCardSet) {
    const linkMap = {};
    const orderedLinks = [];
    experimentCardSet.forEach(locationData => {
      LINK_FIELD_PAIRS.forEach(({ urlField, titleField }) => {
        const urlValue = locationData[urlField.sheetId];
        if (urlValue && !linkMap[urlValue]) {
          linkMap[urlValue] = true;
          const titleValue = locationData[titleField.sheetId] || urlValue;
          orderedLinks.push({ urlValue, titleValue });
        }
      })
    });

    return (
      <div
        key={`cell-content-links-${experimentCardSet[0][EID.sheetId]}`}
      >
        {orderedLinks.map(({ urlValue, titleValue }) => (
          <a key={urlValue} href={urlValue} target="_blank">{titleValue}</a>
        ))}
      </div>
    );
  }

  getScrollHint() {
    const content = (
    <>scroll for more {<TriggerIcon iconType={ICON_TYPE.D_ARROW} />}</>
    );
    return (
      <UserHint
        content={content}
        classes={'scroll-hint'}
        dismissed={this.state.scrollHintDismissed}
      />
    );
  }

  getSelectionHint() {
    const content = (
    <>
      click more map points to compare experiments<p className='maximum'>(max. 3)</p>
      <TriggerIcon iconType={ICON_TYPE.R_ARROW} />
    </>
    );

    let classes = 'selection-hint ';

    if (this.state.scrollHintDismissed) {
      classes += 'sole-hint';
    }
    return (
      <UserHint
        content={content}
        classes={classes}
        dismissed={this.props.selectionHintDismissed}
      />
    );
  }

  render() {
    if (!this.props.cardData.length) {
      return null;
    }

    let classes = 'card-dock-container ';
    classes += `card-count-${this.props.cardData.length}`;
    if (!this.state.minimized) {
      classes += ' maximized';
    }

    return (
      <div
        onWheel={this.slideDock}
        onDoubleClick={this.toggleDock}
        onTouchStart={this.maximizeDock}
        className={'card-dock-wrapper'}
      >
        <div className={classes}>
          {this.getScrollHint()}
          {this.getSelectionHint()}
          <table className="card-dock">
            <thead>
              <tr>{this.getNames()}</tr>
            </thead>
            <tbody>
              {this.getRows()}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default CardDock;
