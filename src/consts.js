const CONTROL_QUERY_STRING = true;
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

const MOBILE_BREAKPOINT = 600;
const MIN_WIDTH_WORLD_VIEW = 800;

export {
  CONTROL_QUERY_STRING,
  QUERY_STRING_BASE,
  ORIGIN_PARAM_MARKER,
  PATH_PARAM_MARKER,
  DEFAULT_SITE_ORIGIN,
  DEFAULT_SITE_PATH,
  MAX_SELECTED_POINTS,
  STARTING_LNG,
  STARTING_LAT,
  STARTING_ZOOM,
  MOBILE_BREAKPOINT,
  MIN_WIDTH_WORLD_VIEW,
}