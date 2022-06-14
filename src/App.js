import './mapbox-gl.css';
import './mapbox-gl-ctrl-zoom-in.svg';
import './mapbox-gl-ctrl-zoom-out.svg';
import './mapbox-gl-ctrl-attrib.svg';
import './mapbox-gl-ctrl-logo.svg';
import './App.scss';
import CardDock from './CardDock';
import ClickHint from './ClickHint';
import IntroPanel from './IntroPanel';
import Legend from './Legend';
import LoadingMask from './LoadingMask';
import React from 'react';
import Tooltip from './Tooltip';
import _ from 'lodash';
import mapboxgl from 'mapbox-gl';
import styleData from './style.json';
import { SHEET_FIELDS } from './fields';
import {
  CONTROL_QUERY_STRING,
  QUERY_STRING_BASE,
  ORIGIN_PARAM_MARKER,
  PATH_PARAM_MARKER,
  DEFAULT_SITE_ORIGIN,
  DEFAULT_SITE_PATH,
  SHEET_URL,
  MAX_SELECTED_POINTS,
  STARTING_LNG,
  STARTING_LAT,
  STARTING_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  MOBILE_MIN_ZOOM,
  MIN_WIDTH_WORLD_VIEW,
  MOBILE_BREAKPOINT,
} from './consts';
// const data = require("./experiments.json")

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const { LONGITUDE, LATITUDE, NAME, LOCATION, STATUS, EID } = SHEET_FIELDS;

// keep off this.state because when one loads we immediately need to know the state of the others
// (which, if they were being set by asynchronous this.setState, we might misread)
const loadState = {
  dataLoaded: false,
  mapLoaded: false,
  mapConfigured: false,
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loaded: false,
      isTouchScreen: false,
      introPanelOpen: false,
      clickHintDismissed: false,
      selectionHintDismissed: false,
      maxCardHintTriggered: false,
      hovered: {},
      selectedIds: [],
      lastUpdate: null,
    };

    this.mapContainer = React.createRef();
    this.appRef = React.createRef();
    this.map = null;

    this.getCardDock = this.getCardDock.bind(this);
    this.getTooltip = this.getTooltip.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.finalizeLoad = this.finalizeLoad.bind(this);
    this.toggleIntroPanelOpen = this.toggleIntroPanelOpen.bind(this);
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
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: false,
      // maxBounds: [
      //   [-170.99, -80], // SW coordinates
      //   [189, 85] // NE coordinates
      // ]
    });

    if (window.innerWidth < MIN_WIDTH_WORLD_VIEW) {
      // for smaller screens, initialize view on US
      this.map.setMinZoom(MOBILE_MIN_ZOOM);
      this.resetUSView();
    }

    this.map.addControl(
      new mapboxgl.AttributionControl({
        customAttribution:
          'This map is supported by the <a href="https://gicp.info/" target="_blank"><strong>Guaranteed Income Community of Practice</strong></a>',
      }),
    );

    this.map.addControl(new mapboxgl.NavigationControl());
    // disable map rotation using right click + drag
    this.map.dragRotate.disable();
    // disable map rotation using touch rotation gesture
    this.map.touchZoomRotate.disableRotation();

    this.map.on('load', this.markMapLoaded.bind(this));

    this.map.on(
      'move',
      _.debounce(
        () => {
          this.featuresOnUnhover();
          // console.log('lat: ', this.map.getCenter().lat.toFixed(4));
          // console.log('lng: ', this.map.getCenter().lng.toFixed(4));
          // console.log('zoom: ', this.map.getZoom().toFixed(2));
        },
        800,
        { leading: true, trailing: false },
      ),
    );

    this.map.on('click', 'experimentSites', this.featuresOnClick.bind(this));
    this.map.on('mouseenter', 'experimentSites', this.featuresOnHover.bind(this));
    this.map.on('mouseleave', 'experimentSites', this.featuresOnUnhover.bind(this));

    this.map.on(
      'touchstart',
      _.debounce(this.registerTouchScreen.bind(this), 3000, { leading: true, trailing: false }),
    );

    load.call(this);
  }

  markMapLoaded() {
    loadState.mapLoaded = true;
    this.finalizeLoad();

    // add the click point hint

    // Duplin, North Carolina
    // let lng = -76.6; // places it right of intro panel but still on screen
    // let lat = 34.8;
    // if (window.innerWidth > MIN_WIDTH_WORLD_VIEW) {
    //   // Barcelona, Spain
    //   lng = 2.1;
    //   lat = 41.2;
    // }

    // let lng = -110.1;
    // let lat = 48.4;
    // if (window.innerWidth <= MIN_WIDTH_WORLD_VIEW) {
    //   lng = -89;
    //   lat = 15.9;
    // }

    // this.hintEl = document.createElement('div');
    // this.hintEl.innerHTML = 'Click a point<br />to learn more';
    // this.hintEl.className = 'click-point-hint';

    // this.hint = new mapboxgl.Marker(this.hintEl)
    //   .setLngLat([lng, lat])
    //   .addTo(this.map);
  }

  finalizeLoad() {
    const { dataLoaded, mapLoaded, mapConfigured } = loadState;
    const loaded = dataLoaded && mapLoaded && mapConfigured;

    // trigger the state change that will tell loading mask to disappear
    this.setState({ loaded });
    if (loaded && window.innerWidth > MOBILE_BREAKPOINT) {
      setTimeout(() => {
        this.setState({ introPanelOpen: true });
      }, 1200);
    }
  }

  registerTouchScreen() {
    // just fire once
    if (this.state.isTouchScreen) {
      return;
    }
    // make points more clickable on mobile
    this.map.setPaintProperty('experimentSites', 'circle-stroke-width', 8);
    this.setState({ isTouchScreen: true });
  }

  getFeaturesByExperimentId(expId) {
    const { features } = this.map.getSource('experiments')._data;
    return features.filter((f) => f.id === expId).map((f) => f.properties);
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
    const selectionHintDismissed = selectedIds.length > 1 || this.state.selectionHintDismissed;
    this.setState({ selectedIds, selectionHintDismissed, clickHintDismissed: true });
    this.map.setFeatureState(
      {
        source: 'experiments',
        id: expId,
      },
      { selected: !alreadySelected },
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
        status: properties[STATUS.sheetId],
        expId,
        x,
        y,
      },
    });
    this.map.setFeatureState(
      {
        source: 'experiments',
        id: expId,
      },
      { hover: true },
    );
  }

  featuresOnUnhover() {
    if (this.state.isTouchScreen || !this.state.hovered.expId) {
      return;
    }
    this.map.getCanvas().style.cursor = '';
    this.map.setFeatureState(
      {
        source: 'experiments',
        id: this.state.hovered.expId,
      },
      { hover: false },
    );

    this.setState({ hovered: {} });
  }

  toggleIntroPanelOpen() {
    this.setState((state) => ({ introPanelOpen: !state.introPanelOpen }));
  }

  removeCard(expId) {
    const selectedIds = [...this.state.selectedIds];
    const idx = selectedIds.indexOf(expId);
    selectedIds.splice(idx, 1);

    if (CONTROL_QUERY_STRING) {
      this.updatePageUrl(selectedIds);
    }

    this.setState({ selectedIds });
    this.map.setFeatureState(
      {
        source: 'experiments',
        id: expId,
      },
      { selected: false },
    );
  }

  getTooltip() {
    if (this.props.isTouchScreen) {
      return;
    }
    const { expId, name, location, status, x, y } = this.state.hovered;
    let otherLocations = [];
    if (expId) {
      const features = this.getFeaturesByExperimentId(expId);
      otherLocations = features.map((f) => f.location).filter((l) => l !== location);
    }
    return (
      <Tooltip
        expId={expId}
        name={name}
        location={location}
        otherLocations={otherLocations}
        status={status}
        x={x}
        y={y}
      />
    );
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
      essential: true,
    });
  }

  resetUSView() {
    this.map.fitBounds([
      [-128, 24],
      [-65, 50],
    ]);
  }

  resetView() {
    window.innerWidth > 800 ? this.resetWorldView() : this.resetUSView();
  }

  getResetViewButton() {
    return (
      <div className="mapboxgl-ctrl mapboxgl-ctrl-group custom">
        <button
          onClick={this.resetView}
          className="mapboxgl-ctrl-reset-view"
          type="button"
          title="Reset view"
          aria-label="Reset view"
        >
          <span className="mapboxgl-ctrl-icon" aria-hidden="true" />
        </button>
      </div>
    );
  }

  getQueryString(ids) {
    if (!ids.length) {
      return '.'; // functions to clear query param
    }
    return QUERY_STRING_BASE + ids.map((numId) => numericToStringEidMap[numId]).join(',');
  }

  updatePageUrl(selectedIds) {
    const queryString = this.getQueryString(selectedIds);
    window.parent.postMessage({ queryString }, this.siteOrigin || DEFAULT_SITE_ORIGIN);
  }

  render() {
    const { loaded, introPanelOpen } = this.state;
    let classes = 'app';
    if (!loaded) {
      classes += ' loading';
    }

    return (
      <div>
        <LoadingMask loaded={loaded} />
        <div className={classes} ref={this.appRef}>
          <IntroPanel open={introPanelOpen} toggleOpen={this.toggleIntroPanelOpen} />
          {this.getCardDock()}
          {this.getTooltip()}
          {this.getResetViewButton()}
          <div ref={this.mapContainer} className="map-container" />
          <Legend lastUpdate={this.state.lastUpdate} />
          <ClickHint dismissed={this.state.clickHintDismissed} />
        </div>
      </div>
    );
  }
}

let nextEidNumber = 1;
const stringToNumericEidMap = {};
const numericToStringEidMap = {};

function load() {
  // startsWith polyfill
  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
      value: function (search, rawPos) {
        const pos = rawPos > 0 ? rawPos | 0 : 0;
        return this.substring(pos, pos + search.length) === search;
      },
    });
  }

  const experimentsData = { type: 'FeatureCollection', features: [] };

  const reqHandler = (source, req) => {
    const rows = JSON.parse(req.responseText).values;
    const lastUpdate = rows.shift()[0];
    this.setState({ lastUpdate });
    rows.splice(0, 4);
    const properties = rows.shift();
    const items = rows
      .map(function (r) {
        const row = {};
        properties.forEach(function (p, pIdx) {
          row[p] = r[pIdx];
          if ([LATITUDE.sheetId, LONGITUDE.sheetId].indexOf(p) !== -1) {
            // mapbox wants numeric lat/long
            // if(!row[p]) return false;
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
          if (p === STATUS.sheetId) {
            // force lower case to simplify equality comparisons
            row[p] = row[p].toLowerCase();
          }
          if (row[p] === null) {
            row[p] = '';
          }
        });

        //if lat or lng is missing from data
        return row[LATITUDE.sheetId] && row[LONGITUDE.sheetId]
          ? {
              type: 'Feature',
              id: row[EID.sheetId],
              geometry: {
                type: 'Point',
                coordinates: [row[LATITUDE.sheetId], row[LONGITUDE.sheetId]],
              },
              properties: row,
            }
          : null;
      })
      .filter(function (r) {
        return r !== null;
      });

    experimentsData.features.push(...items);
    this.map.getSource('experiments').setData(experimentsData);
    loadState.mapConfigured = true;
    this.finalizeLoad();

    if (CONTROL_QUERY_STRING) {
      // extract query params and open experiment cards accordingly
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
        let selectedIds = idString.split(',').map((s) => {
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
        _.each(selectedIds, (id) => {
          this.map.setFeatureState(
            {
              source: 'experiments',
              id,
            },
            { selected: true },
          );
        });
      } catch (error) {
        console.error('Unable to load experiments.');
      }
    }
  };

  // Fetch Local Article Data
  const experimentsReq = new XMLHttpRequest();
  loadState.dataLoaded = true;
  // this.finalizeLoad(); // don't need to call here, as map is not configured yet
  experimentsReq.addEventListener('load', () => {
    reqHandler('experiments', experimentsReq);
  });
  experimentsReq.open('GET', SHEET_URL);
  experimentsReq.send();
}

export default App;
