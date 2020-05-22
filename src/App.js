import './mapbox-gl.css';
import './mapbox-gl-ctrl-zoom-in.svg';
import './mapbox-gl-ctrl-zoom-out.svg';
import './mapbox-gl-ctrl-attrib.svg';
import './mapbox-gl-ctrl-logo.svg';
import './App.scss';
import CardDock from './CardDock';
import IntroPanel from './IntroPanel';
import Legend from './Legend';
import LoadingMask from './LoadingMask';
import React from 'react';
import Tooltip from './Tooltip';
import _ from 'lodash';
import mapboxgl from 'mapbox-gl';
import styleData from './style.json';
import { SHEET_FIELDS } from './fields';

const { LONGITUDE, LATITUDE, NAME, LOCATION, TYPE, EID } = SHEET_FIELDS;

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const QUERY_STRING_BASE = '?sel='; // KEEP IN SYNC WITH BIL-SITE
const ORIGIN_PARAM_MARKER = '&origin='; // KEEP IN SYNC WITH BIL-SITE
const PATH_PARAM_MARKER = '&path='; // KEEP IN SYNC WITH BIL-SITE
// these defaults should never be used as we expect them to be passed in as query params
const DEFAULT_SITE_ORIGIN = 'https://basicincome.stanford.edu';
const DEFAULT_SITE_PATH = '/research/basic-income-experiments/';

const MAX_SELECTED_POINTS = 3;
const STARTING_LNG = -30;
const STARTING_LAT = 29;
const STARTING_ZOOM = 1.5;
const CONTROL_QUERY_STRING = true;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLoaded: false,
      mapLoaded: false,
      mapConfigured: false,
      isTouchScreen: false,
      selectionHintDismissed: false,
      maxCardHintTriggered: false,
      hovered: {},
      selectedIds: []
    };

    this.mapContainer = React.createRef();
    this.appRef = React.createRef();
    this.map = null;

    this.getCardDock = this.getCardDock.bind(this);
    this.getTooltip = this.getTooltip.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.getFeaturesByExperimentId = this.getFeaturesByExperimentId.bind(this);
    this.resetUSView = this.resetUSView.bind(this);
    this.resetWorldView = this.resetWorldView.bind(this);
    this.resetView = this.resetView.bind(this);
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: styleData,
      center: [STARTING_LNG, STARTING_LAT],
      zoom: STARTING_ZOOM,
      maxZoom: 12.5,
      maxBounds: [
        [-170.99, -80], // SW coordinates
        [189, 85] // NE coordinates
      ]
    });

    if (window.innerWidth < 800) {
      // for smaller screens, initialize view on US
      this.resetUSView();
    }

    this.map.addControl(new mapboxgl.NavigationControl());
    // disable map rotation using right click + drag
    this.map.dragRotate.disable();
    // disable map rotation using touch rotation gesture
    this.map.touchZoomRotate.disableRotation();

    this.map.on('load', this.markMapLoaded.bind(this));

    this.map.on('move', _.debounce(() => {
      this.featuresOnUnhover();
      // console.log('lat: ', this.map.getCenter().lat.toFixed(4));
      // console.log('lng: ', this.map.getCenter().lng.toFixed(4));
      // console.log('zoom: ', this.map.getZoom().toFixed(2));
    }, 800, { leading: true, trailing: false }));  
    
    this.map.on('click', 'experimentSites', this.featuresOnClick.bind(this));
    this.map.on('mouseenter', 'experimentSites', this.featuresOnHover.bind(this));
    this.map.on('mouseleave', 'experimentSites', this.featuresOnUnhover.bind(this));

    this.map.on('touchstart', _.debounce(
      this.registerTouchScreen.bind(this),
      3000,
      { leading: true, trailing: false }
    ));
    
    load.call(this); 
  }
  
  markMapLoaded() {
    this.setState({ mapLoaded: true });
  }

  registerTouchScreen() {
    // just fire once
    if (this.state.isTouchScreen) {
      return;
    }
    // make points more clickable on mobile
    this.map.setPaintProperty('experimentSites','circle-stroke-width', 8);
    this.setState({ isTouchScreen: true });
  }

  getFeaturesByExperimentId(expId) {
    const { features } = this.map.getSource('experiments')._data;
    return features.filter(f => f.id === expId).map(f => f.properties);
  }
  
  featuresOnClick(e) {
    const { id: expId } = e.features[0];
    const selectedIds = [...this.state.selectedIds];
    const idx = selectedIds.indexOf(expId);
    const alreadySelected = idx > -1;

    if (!alreadySelected) {
      if (selectedIds.length >= MAX_SELECTED_POINTS) {
        this.setState({ maxCardHintTriggered: true });
        return;
      } else {
        selectedIds.push(expId);
      }
    } else {
      selectedIds.splice(idx, 1);
    }

    if (CONTROL_QUERY_STRING) {
      this.updatePageUrl(selectedIds);
    }

    // dismiss selection hint once multiple points have been selected
    const selectionHintDismissed = (selectedIds.length > 1) || this.state.selectionHintDismissed;
    this.setState({ selectedIds, selectionHintDismissed });
    this.map.setFeatureState({
        source: 'experiments',
        id: expId
      }, { selected: !alreadySelected }
    );
  }

  featuresOnHover(e) {
    if (this.state.isTouchScreen) {
      // devices with touch screens shouldn't have tooltips
      return;
    }
    this.map.getCanvas().style.cursor = 'pointer';
    const { id: expId, properties } = e.features[0];    
    const { x, y } = e.point;

    this.setState({ 
      hovered: {
        name: properties[NAME.sheetId],
        location: properties[LOCATION.sheetId],
        type: properties[TYPE.sheetId],
        expId,
        x,
        y 
      }
    });
    this.map.setFeatureState({
        source: 'experiments',
        id: expId
      }, { hover: true }
    );
  }

  featuresOnUnhover() {
    if (this.state.isTouchScreen || !this.state.hovered.expId) {
      return;
    }
    this.map.getCanvas().style.cursor = '';
    this.map.setFeatureState({
        source: 'experiments',
        id: this.state.hovered.expId
      }, { hover: false }
    );

    this.setState({ hovered: {} });
  }

  removeCard(expId) {
    const selectedIds = [...this.state.selectedIds];
    const idx = selectedIds.indexOf(expId);
    selectedIds.splice(idx, 1);

    if (CONTROL_QUERY_STRING) {
      this.updatePageUrl(selectedIds);
    }

    this.setState({ selectedIds });
    this.map.setFeatureState({
        source: 'experiments',
        id: expId
      }, { selected: false }
    );
  }

  getTooltip() {
    if (this.props.isTouchScreen) {
      return;
    }
    const { expId, name, location, type, x, y } = this.state.hovered;
    let otherLocations = [];
    if (expId) {
      const features = this.getFeaturesByExperimentId(expId);
      otherLocations = features
        .map(f => f.location)
        .filter(l => l !== location);
    }
    return <Tooltip expId={expId} name={name} location={location} otherLocations={otherLocations} type={type} x={x} y={y}/>;
  }

  getCardDock() {
    if (!this.map) {
      return null;
    }

    const { selectedIds, isTouchScreen, selectionHintDismissed, maxCardHintTriggered } = this.state;
    const cardData = selectedIds.map(this.getFeaturesByExperimentId);

    const siteUrl =
      (this.siteOrigin || DEFAULT_SITE_ORIGIN) +
      (this.sitePath || DEFAULT_SITE_PATH) +
      this.getQueryString(this.state.selectedIds);
    return (
      <CardDock
        removeCard={this.removeCard}
        cardData={cardData}
        isTouchScreen={isTouchScreen}
        selectionHintDismissed={selectionHintDismissed}
        maxCardHintTriggered={maxCardHintTriggered}
        appRef={this.appRef}
        siteUrl={siteUrl}
      />
    );
  }

  resetWorldView() {
    this.map.flyTo({
      center: [STARTING_LNG, STARTING_LAT],
      zoom: STARTING_ZOOM,
      essential: true
    });
  }

  resetUSView() {
    this.map.fitBounds([
      [-128, 24],
      [-65, 50]
    ]);
  }

  resetView() {
    window.innerWidth > 800 ? this.resetWorldView() : this.resetUSView();
  }

  getResetViewButton() {
    return (
      <div className='mapboxgl-ctrl mapboxgl-ctrl-group custom'>
        <button
          onClick={this.resetView}
          className='mapboxgl-ctrl-reset-view'
          type='button'
          title='Reset view'
          aria-label='Reset view'
        >
          <span className='mapboxgl-ctrl-icon' aria-hidden='true' />
        </button>
      </div>
    );
  }

  getQueryString(ids) {
    if (!ids.length) {
      return '.'; // functions to clear query param
    }
    return QUERY_STRING_BASE + ids.map(numId => numericToStringEidMap[numId]).join(',');
  }

  updatePageUrl(selectedIds) {
    const queryString = this.getQueryString(selectedIds);
    window.parent.postMessage({ queryString }, this.siteOrigin || DEFAULT_SITE_ORIGIN);
  }
  
  render() {
    const { dataLoaded, mapLoaded, mapConfigured } = this.state;
    const loading = !dataLoaded || !mapLoaded || !mapConfigured;
    let classes = 'app';
    if (loading) {
      classes += ' loading';
    }

    return (
      <div>
        <LoadingMask dataLoaded={dataLoaded} mapLoaded={mapLoaded} mapConfigured={mapConfigured} />
        <div className={classes} ref={this.appRef}>
          <IntroPanel />
          {this.getCardDock()}
          {this.getTooltip()}
          {this.getResetViewButton()}
          <div ref={this.mapContainer} className='map-container' />
          <Legend />
        </div>
      </div>
    );
  }
}

let nextEidNumber = 1;
const stringToNumericEidMap = {};
const numericToStringEidMap = {};

function load () {
  // startsWith polyfill
  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function(search, rawPos) {
            const pos = rawPos > 0 ? rawPos|0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
  }

  const experimentsData = { type: 'FeatureCollection', features: [] };

  const reqHandler = (source, req) => {
    const [ columnHeaderRow, ...rows ] = JSON.parse(req.responseText).feed.entry;
    const properties = Object.keys(rows[0])
      .filter(function (p) { 
        return p.startsWith('gsx$') & !p.endsWith('_db1zf');
      })
      .map(function (p) { return p.substr(4); });
    
    const items = rows.map(function (r, ri) {
      const row = {};
      properties.forEach(function (p) {
        row[p] = r['gsx$' + p].$t === '' ? null : r['gsx$' + p].$t;
        if ([LATITUDE.sheetId, LONGITUDE.sheetId].indexOf(p) !== -1) {
          // mapbox wants numeric lat/long
          row[p] = +row[p];
        }
        if (p === EID.sheetId) {
          // convert the string eids from the sheet into numeric ids (which mapbox expects)
          const stringEid = row[p];
          const numericEid = stringToNumericEidMap[stringEid] || nextEidNumber++;
          stringToNumericEidMap[stringEid] = numericEid;
          // populate to use for sending query params
          numericToStringEidMap[numericEid] = stringEid;
          row[p] = numericEid;
        }
        if (p === TYPE.sheetId) {
          // force lower case to simplify equality comparisons
          row[p] = row[p].toLowerCase();
        }
        if (row[p] === null) {
          row[p] = '';
        }
      });
      return {
        type: 'Feature',
        id: row[EID.sheetId],
        geometry: {
          type: 'Point',
          coordinates: [row[LATITUDE.sheetId], row[LONGITUDE.sheetId]]
        },
        properties: row
      };
    });
    
    experimentsData.features.push(...items);
    this.map.getSource('experiments').setData(experimentsData);
    this.setState({ mapConfigured: true });

    if (CONTROL_QUERY_STRING) {
      try {
        const queryString = window.location.search;
        const selectionParamStartIdx = queryString.indexOf(QUERY_STRING_BASE);
        const selectionValueStartIdx = selectionParamStartIdx + QUERY_STRING_BASE.length;
        const originParamStartIdx = queryString.indexOf(ORIGIN_PARAM_MARKER);
        let idString = '';
        if (originParamStartIdx < 0) {
          // there's no origin passed in - perhaps we're running outside of iframe
          idString = queryString.slice(selectionValueStartIdx);
        } else {
          idString = queryString.slice(selectionValueStartIdx, originParamStartIdx);

          const originValueStartIdx = originParamStartIdx + ORIGIN_PARAM_MARKER.length;
          const pathParamStartIdx = queryString.indexOf(PATH_PARAM_MARKER);

          if (pathParamStartIdx < 0) {
            this.siteOrigin = queryString.slice(originValueStartIdx);
            // console.error('Map did not receive a sitePath');
          } else {
            this.siteOrigin = queryString.slice(originValueStartIdx, pathParamStartIdx);
            
            const pathValueStartIdx = pathParamStartIdx + PATH_PARAM_MARKER.length;
            this.sitePath = queryString.slice(pathValueStartIdx);
            // console.log('idString:',idString,' | siteOrigin:',this.siteOrigin,' | sitePath:',this.sitePath);
          }
        }

        if (!idString.length) {
          return;
        }
        let selectedIds = idString.split(',').map(s => {
          const numericEid = stringToNumericEidMap[s];
          if (!numericEid) {
            // console.error(`${s} does not correspond to an experiment id - ignoring.`)
          }
          return numericEid;
        });

        selectedIds = _.compact(selectedIds);
        selectedIds = _.uniq(selectedIds);
        selectedIds = selectedIds.slice(0, MAX_SELECTED_POINTS);

        this.updatePageUrl(selectedIds);
        if (!selectedIds.length) {
          return;
        }

        const selectionHintDismissed = selectedIds.length > 1;
        this.setState({ selectedIds, selectionHintDismissed });
        _.each(selectedIds, id => {
          this.map.setFeatureState({
            source: 'experiments',
            id,
          }, { selected: true });
        });
      } catch (error) {
        console.error('Unable to load experiments.');
      }
    }
  }

  // Fetch Local Article Data
  const experimentsReq = new XMLHttpRequest();
  this.setState({ dataLoaded: true });
  experimentsReq.addEventListener('load',  () => { reqHandler('experiments', experimentsReq) });
  experimentsReq.open('GET', process.env.REACT_APP_SHEET_URL);
  experimentsReq.send();
}

export default App;
