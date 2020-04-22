import React from 'react';
import _ from 'lodash';
import TriggerIcon, { ICON_TYPE } from './TriggerIcon';
import { SHEET_FIELDS, ORDERED_CARD_FIELDS, COMPOSITE_FIELDS, LINK_FIELD_PAIRS } from './fields';
import UserHint from './UserHint';

const { LOCATION, NAME, EID, TYPE, WEBSITE } = SHEET_FIELDS;

// time (in seconds) before the max card user hint auto-dismisses
const MAX_CARD_HINT_TIMEOUT = 30;

// pure component? (shallow compare map features?) (perf)
class CardDock extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      expandedProperties: {},
      scrollHintDismissed: false,  
      maxPointHintDismissed: false
    };

    this.removeCard = this.removeCard.bind(this);
    this.slideDock = this.slideDock.bind(this);
    this.toggleDock = this.toggleDock.bind(this);
    this.maximizeDock = this.maximizeDock.bind(this);
    this.toggleProperty = this.toggleProperty.bind(this);
    this.dismissMaxPointHint = this.dismissMaxPointHint.bind(this);
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.cardData.length !== this.props.cardData.length) {
      // necessary to ensure smooth height transitions
      this.setState({ expandedProperties: {} });

      const cardWasRemoved = newProps.cardData.length < this.props.cardData.length;
      if (cardWasRemoved && this.props.maxCardHintTriggered && !this.state.maxPointHintDismissed) {
        // if a card is removed after hint is given, dismiss hint
        this.dismissMaxPointHint();
      }
    }
    if (newProps.maxCardHintTriggered !== this.props.maxCardHintTriggered) {
      setTimeout(this.dismissMaxPointHint, 1000 * MAX_CARD_HINT_TIMEOUT);
    }
  }

  removeCard(id) {
    this.props.removeCard(id);
  }

  slideDock(e) {
    if (e.deltaY && e.deltaY > 0) {
      this.setState({ scrollHintDismissed: true });
    }
  }

  toggleProperty(property, expanded) {
    const expandedProperties = {...this.state.expandedProperties};
    expandedProperties[property] = !expanded;

    // necessary to ensure smooth height transitions
    try {
      const elems = document.getElementsByClassName(`cell ${property}`);
      const greatestHeight = _.max(_.map(elems, 'scrollHeight'));
      _.each(elems, elem => {
        elem.style.maxHeight = greatestHeight + 20 + 'px';
      })
    }
    catch(e) {}

    this.setState({ expandedProperties });
  }

  getNames() {
    // TODO: don't bind in render (perf)
    return this.props.cardData.map((experimentCardSet, idx) => {
      const {
        [EID.sheetId]: eid,
        [NAME.sheetId]: name,
        [TYPE.sheetId]: type
      } = experimentCardSet[0];
      // add type to class so we can color-code
      const classes = `card card-${idx} ${type}`;
      return (
        <div className={classes} key={'header'+eid} >
          <div className='cell'>
            {name||'(none)'}
            <TriggerIcon iconType={ICON_TYPE.REMOVE} onClick={this.removeCard.bind(this, eid)} />
          </div>
        </div>
    )});
  }

  getRows() {
    // form a row for each field
    return ORDERED_CARD_FIELDS.map(field => {
      const { displayName, sheetId, isFeatureHeader } = field;

      const expandible = this.getIsExpandible(field);

      const expanded = !!this.state.expandedProperties[sheetId];

      let expandIcon = null;
      if (expandible) {
        // TODO: also don't bind in render (perf)
        const iconType = expanded ? ICON_TYPE.COLLAPSE : ICON_TYPE.EXPAND;
        expandIcon = (
          <TriggerIcon
            onClick={this.toggleProperty.bind(this, sheetId, expanded)}
            iconType={iconType}
          />
        );
      }

      let cellClass = 'cell ' + sheetId;
      if (expandible) {
        cellClass += ' expandible';
      }
      if (expanded) {
        cellClass += ' expanded';
      }
      if (isFeatureHeader) {
        cellClass += ' feature-header';
      }

      // form a cell for each experiment for that field
      const cells = this.props.cardData.map((experimentCardSet, idx) => {

        const { [EID.sheetId]: eid } = experimentCardSet[0];
        return (
          <div className={`card card-${idx}`} key={displayName+eid}>
            <div className={cellClass}>
              <div className='property-name'>{displayName}{expandIcon}</div>
              <div className={'value'}>{this.getCellContent(experimentCardSet, field)}</div>
            </div>
          </div>
      )});
      
      return <div className='row' key={displayName}>{cells}</div>;
    });
  }

  // whether a given row should be expandible (succinct cells don't need expand triggers)
  // TODO: use ref, and after rerender check height, add classname accordingly?
  getIsExpandible(field) {
    if (field === LOCATION) {
      // if any experimint in the card dock has multiple locations, the location cell should be expandible
      return _.some(this.props.cardData, expCardSet => expCardSet.length > 2);
    }
    // TODO: should fields designate isExpandible? if so, use here
    if (field.isComposite || field.isFeatureHeader) {
      // TODO: should composite rows (Related Resources be expandible? how to measure?)
      return false;
    }
    if (_.some(this.props.cardData, expCardSet => this.getIsDifferentiated(expCardSet, field))) {
      // if any selected experiment has differentiated data for the field, cell should be expandible
      return true;
    }

    // if any experiment's value for the cell is longer than X characters
    return _.some(this.props.cardData, expCardSet => {
      // only need to check first location since we only hit this case if cell is undifferentiated
      return expCardSet[0][field.sheetId].length > 120;
    });
  }

  // returns true if the data for a given field of a given experiment
  // has differing values across experiment locations
  getIsDifferentiated(experimentCardSet, field) {
    if (field.forceUniformValue || experimentCardSet.length === 1) {
      // certain fields we never let be differentiated
      // and data can't be differentiated if there's only one location
      return false;
    }
    const { sheetId } = field;
    const [locationOneData, ...otherLocationsData] = experimentCardSet;
    const firstValue = locationOneData[sheetId];
    return _.some(otherLocationsData, l => l[sheetId] !== firstValue);
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
    const firstValue = experimentCardSet[0][sheetId];

    if (field === WEBSITE && firstValue.includes('.')) {
      // make sure website is linkified if it's a link. otherwise it'll be caught
      // by the next condition, for all undifferentiated fields
      return <a href={firstValue} target="_blank">{firstValue}</a>;
    } else if (!this.getIsDifferentiated(experimentCardSet, field)) {
      // for undifferentiated fields, the cell content is the field value
      // for the first (and perhaps only) location
      return firstValue;
    }
    // break cell into block for each location, as they have different values
    return (
      <>
        {experimentCardSet.map(locationData => {
          const {
            [EID.sheetId]: eid,
            [LOCATION.sheetId]: location,
          } = locationData;
          return (
            <div key={`cell-content-${sheetId}-${eid}-${location}`}>
              <div
                title={location}
                className='location-title'
              >
                {location}
              </div>
              {locationData[sheetId]}
            </div>
          )
        })}
      </>
    );
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
    const content = <>scroll for more {<TriggerIcon iconType={ICON_TYPE.D_ARROW} />}</>
    return (
      <UserHint
        content={content}
        classes={'scroll-hint'}
        dismissed={this.state.scrollHintDismissed || this.props.maxCardHintTriggered}
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

    let classes = 'selection-hint';
    if (this.state.scrollHintDismissed) {
      classes += ' scroll-initiated';
    }
    
    return (
      <UserHint
        content={content}
        classes={classes}
        dismissed={this.props.selectionHintDismissed}
      />
      );
    }
  
    getMaxPointHint() {
      const content = <>Only 3 experiments may be viewed at once. Remove a card to add another experiment.</>

      let classes = 'max-point-hint';
      if (this.props.maxCardHintTriggered) {
        classes += ' triggered'
      }

      return (
        <UserHint
          content={content}
          classes={classes}
          onDismiss={this.dismissMaxPointHint}
          dismissed={this.state.maxPointHintDismissed}
        />
      );
    }

    dismissMaxPointHint() {
      this.setState({ maxPointHintDismissed: true });
    }
    
    render() {
      if (!this.props.cardData.length) {
        return null;
      }
      
      const classes = `card-dock card-count-${this.props.cardData.length}`;
      return (
        <div
        onWheel={this.slideDock}
        onDoubleClick={this.toggleDock}
        onTouchStart={this.maximizeDock}
        className={'card-dock-container'}
      >
        <div className={classes}>
          <div className="card-table">
          {this.getScrollHint()}
          {this.getSelectionHint()}
          {this.getMaxPointHint()}
            <div className='row header'>{this.getNames()}</div>
            {this.getRows()}
          </div>
        </div>
      </div>
    )
  }
}

export default CardDock;
