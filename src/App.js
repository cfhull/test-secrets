import './App.scss';
import CardDock from './CardDock';
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
const STARTING_LNG = -98;
const STARTING_LAT = 40;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 3,
      hovered: {},
      selectedIds: [],
      isTouchScreen: false,
      selectionHintDismissed: false,
      maxCardHintTriggered: false,
      mapLoaded: false,
      dataLoaded: false,
      mapLoaded: false,
      mapConfigured: false
    };

    this.map = null;
    this.getCardDock = this.getCardDock.bind(this);
    this.getTooltip = this.getTooltip.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.getFeaturesByExperimentId = this.getFeaturesByExperimentId.bind(this);
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: styleData,
      center: [STARTING_LNG, STARTING_LAT],
      zoom: this.state.zoom,
    });
    
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

    this.map.on('touchstart', 'experimentSites', this.registerTouchScreen.bind(this));
    
    load.call(this); 
  }
  
  markMapLoaded() {
    this.setState({ mapLoaded: true });
  }

  registerTouchScreen() {
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
      />
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
        <div className={classes}>
          {this.getCardDock()}
          {this.getTooltip()}
          <div ref={el => this.mapContainer = el} className='map-container' />
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
    console.log('TWO', new Date);
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
  }

  // Fetch Local Article Data
  const experimentsReq = new XMLHttpRequest();
  this.setState({ dataLoaded: true });
  experimentsReq.addEventListener('load',  () => { reqHandler('experiments', experimentsReq) });
  experimentsReq.open('GET', process.env.REACT_APP_SHEET_URL);
  experimentsReq.send();
}

export default App;
