import React from 'react';
import * as smoothscroll from 'smoothscroll-polyfill';
import _ from 'lodash';
import TriggerIcon, { ICON_TYPE } from './TriggerIcon';
import ExportFooter from './ExportFooter.js';
import { SHEET_FIELDS, ORDERED_CARD_FIELDS, ORDERED_CSV_FIELDS, COMPOSITE_FIELDS, LINK_FIELD_PAIRS } from './fields';
import UserHint from './UserHint';

smoothscroll.polyfill();

const { LOCATION, NAME, EID, TYPE, WEBSITE } = SHEET_FIELDS;

// minimum scroll offset (in px) required to reveal the side buttons (for scroll-up and scroll to export footer)
const SIDE_BUTTONS_SCROLL_OFFSET = 200;
// time (in seconds) before the max card user hint auto-dismisses
const MAX_CARD_HINT_TIMEOUT = 30;
// delay (in ms) between fires of the scroll handler. 
const SCROLL_THROTTLE_DELAY = 200;
// delay (in ms) between fires of a back-up updateScroll handler for mobile.
const IOS_SCROLL_FIX_INTERVAL = 600;

// this will catch many other cases (including Chrome Android...), really only necessary for iPad
const SCROLL_GAP_FIX = navigator.userAgent.indexOf('AppleWebKit') > 0
  && navigator.userAgent.indexOf('Safari') > 0;

// pure component? (shallow compare map features?) (perf)
class CardDock extends React.PureComponent {
  constructor(props) {
    super(props);

    // FIELDS NO LONGER EXPANDIBLE
    // uncomment 'expand' and 'toggle'-related code here & in CSS to reactivate
    this.state = {
      // expandedProperties: {},
      // duplicates isTouchScreen prop, but if app loads with active experiment and user scrolls
      // before touching map, we wouldn't know to disable mask without this
      isMobile: false,
      scrollHintDismissed: false,  
      maxPointHintDismissed: false,
      mapMaskActive: false,
      bottomMaskActive: false,
      sideButtonsActive: false,
      printHeading: `Test print heading`,
      printText: `<p>test para number 1</p><p>test para number 2</p>`
    };

    this.cardDockContainerRef = React.createRef();
    this.cardDockContainerHeight = 0;

    this.removeCard = this.removeCard.bind(this);
    this.updateScroll = this.updateScroll.bind(this);
    this.updateScrollMobile = this.updateScrollMobile.bind(this);
    this.setMobile = this.setMobile.bind(this);
    // this.toggleProperty = this.toggleProperty.bind(this);
    this.dismissMaxPointHint = this.dismissMaxPointHint.bind(this);
    this.scrollUp = this.scrollUp.bind(this);
    this.scrollDown = this.scrollDown.bind(this);
    this.exportCSV = this.exportCSV.bind(this);
    this.throttledUpdateScroll = _.throttle(
      this.throttledUpdateScroll,
      SCROLL_THROTTLE_DELAY,
      { leading: true, trailing: true }
    ).bind(this);

    this.scrollInterval = null;
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.cardData.length !== this.props.cardData.length) {
      // necessary to ensure smooth height transitions
      // this.setState({ expandedProperties: {} });

      const cardWasRemoved = newProps.cardData.length < this.props.cardData.length;
      if (cardWasRemoved && this.props.maxCardHintTriggered && !this.state.maxPointHintDismissed) {
        // if a card is removed after hint is given, dismiss hint
        this.dismissMaxPointHint();
      }
    }

    if (!newProps.cardData.length) {
      this.setState({ mapMaskActive: false });
    }

    if (newProps.maxCardHintTriggered !== this.props.maxCardHintTriggered) {
      setTimeout(this.dismissMaxPointHint, 1000 * MAX_CARD_HINT_TIMEOUT);
    }
  }

  componentDidUpdate() {
    // for fixing iPad CardDock scrolls too far bug
    if (!SCROLL_GAP_FIX || !_.get(this, 'cardDockContainerRef.current')) {
      return;
    }
    this.cardDockContainerHeight = this.cardDockContainerRef.current.getBoundingClientRect().height;
  }

  removeCard(id) {
    this.props.removeCard(id);
  }

  setMobile() {
    if (this.state.isMobile) {
      return;
    }
    this.setState({ isMobile: true });

    this.scrollInterval = setInterval(() => {
      this.throttledUpdateScroll();
    }, IOS_SCROLL_FIX_INTERVAL);
  }

  updateScroll(e) {
    this.throttledUpdateScroll(e.deltaY);
  }
  
  updateScrollMobile(e) {
    this.setMobile();
    this.updateScroll(e);
  }

  throttledUpdateScroll(deltaY) {
    const { scrollTop } = this.props.appRef.current;

    let mapMaskActive = false;
    if (this.state.isMobile) {
      // no mask on mobile
    } else if (scrollTop > 5) {
      mapMaskActive = true;
    }

    const SCROLL_BUFFER = 800;
    let bottomMaskActive = false;
    if (SCROLL_GAP_FIX && // ensure we want to use fix
        this.cardDockContainerHeight && // ensure we want to use fix
        scrollTop > window.innerHeight + SCROLL_BUFFER && // we've scrolled down a safe amount (won't mask map above)
        (scrollTop + SCROLL_BUFFER) > this.cardDockContainerHeight // approaching bottom of CardDock
    ) {
      bottomMaskActive = true; // all true, so show mask to cover space below CardDock

      if (scrollTop > this.cardDockContainerHeight) {
        // we've *passed* CardDock bottom - gently pull it back down
        this.props.appRef.current.scroll({
          top: this.cardDockContainerHeight,
          behavior: 'smooth'
        });
      }
    }

    const sideButtonsActive = scrollTop > SIDE_BUTTONS_SCROLL_OFFSET;

    this.setState({ scrollHintDismissed: true, sideButtonsActive, mapMaskActive, bottomMaskActive });
  }

  // toggleProperty(property, expanded) {
  //   const expandedProperties = {...this.state.expandedProperties};
  //   expandedProperties[property] = !expanded;

  //   // necessary to ensure smooth height transitions
  //   try {
  //     const elems = document.getElementsByClassName(`cell ${property}`);
  //     const greatestHeight = _.max(_.map(elems, 'scrollHeight'));
  //     _.each(elems, elem => {
  //       elem.style.maxHeight = greatestHeight + 20 + 'px';
  //     })
  //   }
  //   catch(e) {}

  //   this.setState({ expandedProperties });
  // }

  getTableContent() {
    if (!this.props.cardData.length) {
      return null;
    }

    return (
      <>
        {this.getScrollHint()}
        {this.getSelectionHint()}
        {this.getMaxPointHint()}
        {this.getPrintIntro()}
        {this.getNames()}
        {this.getRows()}
        {this.getSideButtons()}
      </>
    );
  }

  getNames() {
    // TODO: don't bind in render (perf)
    const names = this.props.cardData.map((experimentCardSet, idx) => {
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
            <TriggerIcon iconType={ICON_TYPE.XCLOSE} onClick={this.removeCard.bind(this, eid)} />
          </div>
        </div>
    )});
    return <div className='row header'>{names}</div>;
  }

  getRows() {
    // form a row for each field
    return ORDERED_CARD_FIELDS.map(field => {
      const { displayName, sheetId, isFeatureHeader } = field;

      // const expandible = this.getIsExpandible(field);

      // const expanded = !!this.state.expandedProperties[sheetId];

      let expandIcon = null;
      // if (expandible) {
      //   // TODO: also don't bind in render (perf)
      //   const iconType = expanded ? ICON_TYPE.COLLAPSE : ICON_TYPE.EXPAND;
      //   expandIcon = (
      //     <TriggerIcon
      //       onClick={this.toggleProperty.bind(this, sheetId, expanded)}
      //       iconType={iconType}
      //     />
      //   );
      // }

      let cellClass = 'cell ' + sheetId;
      // if (expandible) {
      //   cellClass += ' expandible';
      // }
      // if (expanded) {
      //   cellClass += ' expanded';
      // }
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
  // getIsExpandible(field) {
  //   if (field === LOCATION) {
  //     // if any experimint in the card dock has multiple locations, the location cell should be expandible
  //     return _.some(this.props.cardData, expCardSet => expCardSet.length > 2);
  //   }
  //   // TODO: should fields designate isExpandible? if so, use here
  //   if (field.isComposite || field.isFeatureHeader) {
  //     // TODO: should composite rows (Related Resources be expandible? how to measure?)
  //     return false;
  //   }
  //   if (_.some(this.props.cardData, expCardSet => this.getIsDifferentiated(expCardSet, field))) {
  //     // if any selected experiment has differentiated data for the field, cell should be expandible
  //     return true;
  //   }

  //   // if any experiment's value for the cell is longer than X characters
  //   return _.some(this.props.cardData, expCardSet => {
  //     // only need to check first location since we only hit this case if cell is undifferentiated
  //     return expCardSet[0][field.sheetId].length > 120;
  //   });
  // }

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
      return <a href={firstValue} target='_blank' rel='noopener noreferrer'>{firstValue}</a>;
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
          <a key={urlValue} href={urlValue} target='_blank' rel='noopener noreferrer'>{titleValue}</a>
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
  
  getPrintIntro() {
    const heading = this.state.printHeading;
    const text = this.state.printText;
    return (
      <div className="print-intro">
        <h1>{heading}</h1>
        <div className="intro-text" dangerouslySetInnerHTML={{ __html: text }}></div>
      </div>
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

  getSideButtons() {
    let classes = 'side-buttons';
    if (this.state.sideButtonsActive) {
      classes += ' active';
    }

    return (
      <div className={classes}>
        <div className='scroll-up-button' onClick={this.scrollUp} title='Scroll to top' />
        <div className='share-export' onClick={this.scrollDown} title='Scroll to export options' />  
      </div>
    )
  }

  getExportFooter() {
    if (!this.props.cardData.length) {
      return null;
    }
    const classes = `card-count-${this.props.cardData.length}`;
    return (
      <ExportFooter
        exportCSV={this.exportCSV}
        siteUrl={this.props.siteUrl}
        classes={classes}
      />
    )
  }
  
  scrollUp() {
    // if there's a scrollInterval, let that deal with hint dismissing sidebuttons so it doesn't oscillate off/on
    const sideButtonsActive = this.scrollInterval;

    this.setState({ mapMaskActive: false, bottomMaskActive: false, sideButtonsActive });
    this.props.appRef.current.scroll({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  scrollDown() {
    this.setState({ bottomMaskActive: true });
    this.props.appRef.current.scroll({
      top: this.cardDockContainerHeight || 10000, // height if we have it, else big number (scroll all the way down)
      behavior: 'smooth'
    });
  };

  exportCSV() {
    try {
      const { cardData } = this.props;
      const headers = _.map(ORDERED_CSV_FIELDS, 'displayName');

      const valueArrays = [headers];
      _.each(cardData, experimentCardSet => {
        _.each(experimentCardSet, locationData => {
          valueArrays.push(_.map(ORDERED_CSV_FIELDS, f => {
            let v = locationData[f.sheetId];
            // seems new lines are fine
            // v = v.replace(/\n/gm, ''); 
            v = v.replace(/"/gm, "'");
            return v ? `"${v}"` : "";
          }));
        });
      });

      let csv = '';
      _.each(valueArrays, row => {
        csv += row.join(',');
        csv += '\n';
      })
      
      const hiddenElement = document.createElement('a');
      // encodeURI broke on #:
      // https://stackoverflow.com/questions/55267116/how-to-download-csv-using-a-href-with-a-number-sign-in-chrome
      hiddenElement.href = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'BILData.csv';
      hiddenElement.click();
      hiddenElement.remove();
    } catch (error) {
      // console.error('Unable to export to CSV. Please try again. ' + error);
    }
  }

  render() {
    // always return a card dock (getTableContent will return null if nothing's selected)
    // this prevents the map from jumping in transitions between 0-1 selections on iOS
    // if (!this.props.cardData.length) {
    //   return null;
    // }
    
    const classes = `card-dock card-count-${this.props.cardData.length}`;

    let maskClass = 'card-dock-mask';
    if (this.state.mapMaskActive && !this.state.isMobile) {
      maskClass += ` active card-count-${this.props.cardData.length}`;
    }
    return (
      <div>
        {this.state.bottomMaskActive && <div className='bottom-mask'/>}
        <div
          className={maskClass}
          onWheel={this.updateScroll}
          onTouchMove={this.updateScrollMobile}
          // onScroll={this.updateScroll}
          >
          <div
            onWheel={this.updateScroll}
            onTouchMove={this.updateScrollMobile}
            // onScroll={this.updateScroll}
            className={'card-dock-container'}
            ref={this.cardDockContainerRef}
          >
            <div className={classes}>
              <div className='card-table'>
                {this.getTableContent()}
              </div>
            </div>
            {this.getExportFooter()}
          </div>
        </div>
      </div>
    )
  }
}

export default CardDock;
