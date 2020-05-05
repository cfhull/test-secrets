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
const MAX_SELECTED_POINTS = 3;
const STARTING_LNG = -30;
const STARTING_LAT = 29;
const STARTING_ZOOM = 1.5;
const CONTROL_QUERY_STRING = false;

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
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: styleData,
      center: [STARTING_LNG, STARTING_LAT],
      zoom: STARTING_ZOOM,
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
      console.log('lat: ', this.map.getCenter().lat.toFixed(4));
      console.log('lng: ', this.map.getCenter().lng.toFixed(4));
      console.log('zoom: ', this.map.getZoom().toFixed(2));
    }, 200, { leading: true, trailing: false }));  
    
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
      const queryString = '?s=' + selectedIds.join(',');
      window.parent.postMessage({ selectedIds: selectedIds, queryString }, 'http://localhost:1313');
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
      const queryString = '?selected=' + selectedIds.join(',');
      window.parent.postMessage({ selectedIds: selectedIds, queryString }, 'http://localhost:1313');
    }

    this.setState({ selectedIds });
    this.map.setFeatureState({
        source: 'experiments',
        id: expId
      }, { selected: false }
    );
  }

  getTooltip() {
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
    return (
      <CardDock
        removeCard={this.removeCard}
        cardData={cardData}
        isTouchScreen={isTouchScreen}
        selectionHintDismissed={selectionHintDismissed}
        maxCardHintTriggered={maxCardHintTriggered}
        appRef={this.appRef}
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

  getResetViewButton() {
    const onClick = () => {window.innerWidth > 800 ? this.resetWorldView() : this.resetUSView()}

    return (
      <div className='mapboxgl-ctrl mapboxgl-ctrl-group custom'>
        <button
          onClick={onClick}
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
const eidMap = {};

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
          const numericEid = eidMap[stringEid] || nextEidNumber++;
          eidMap[stringEid] = numericEid;
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
      // TODOXXX: use real eids, limit 3?, filter out non-experiments, wrap in try, unique only
      const queryString = window.location.search;
      const idString = window.location.search.slice(window.location.search.indexOf('=') + 1);
      if (!idString.length) {
        return;
      }
      const selectedIds = idString.split(',').map(s => Number(s));
      const selectionHintDismissed = selectedIds.length > 1;
      this.setState({ selectedIds, selectionHintDismissed });
      _.each(selectedIds, id => {
        this.map.setFeatureState({
            source: 'experiments',
            id,
          }, { selected: true }
        );
      });
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
