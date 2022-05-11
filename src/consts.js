const CONTROL_QUERY_STRING = true;
const QUERY_STRING_BASE = '?sel='; // KEEP IN SYNC WITH BIL-SITE
const ORIGIN_PARAM_MARKER = '&origin='; // KEEP IN SYNC WITH BIL-SITE
const PATH_PARAM_MARKER = '&path='; // KEEP IN SYNC WITH BIL-SITE
// these defaults should never be used as we expect them to be passed in as query params
const DEFAULT_SITE_ORIGIN = 'https://basicincome.stanford.edu';
const DEFAULT_SITE_PATH = '/research/basic-income-experiments/';

const SHEET_URL =
  'https://sheets.googleapis.com/v4/spreadsheets/1dGts9mhsRIUaetl-uslgQYMrs6sC1lQg2BZp5fuCoxU/values/US%20%26%20Canada%20-%20Clean%20for%20app?alt=json&key=AIzaSyD1qajG1iNe_ISqbiCNY3mbrkTTo7v3j4U';
  // 'https://sheets.googleapis.com/v4/spreadsheets/1dGts9mhsRIUaetl-uslgQYMrs6sC1lQg2BZp5fuCoxU/values/US+and+Canada+pilots%2Fexperiments+and+programs+?alt=json&key=AIzaSyD1qajG1iNe_ISqbiCNY3mbrkTTo7v3j4U';
  // 'https://sheets.googleapis.com/v4/spreadsheets/1R2n9m-yA37LOIcUnBT5ZVu2LZyhKl5j46YTqkZMZzyM/values/Sheet1?alt=json&key=AIzaSyD1qajG1iNe_ISqbiCNY3mbrkTTo7v3j4U';

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
  SHEET_URL,
  MAX_SELECTED_POINTS,
  STARTING_LNG,
  STARTING_LAT,
  STARTING_ZOOM,
  MOBILE_BREAKPOINT,
  MIN_WIDTH_WORLD_VIEW,
};