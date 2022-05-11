const SHEET_FIELDS = {
  LONGITUDE: {
    displayName: 'Longitude', // how the field will appear on the card
    sheetId: 'longitude' // corresponds to the column header on the google sheet
  },
  LATITUDE: {
    displayName: 'Latitude',
    sheetId: 'latitude'
  },
  // NOTE: Used to bind the different locations of a given experiment together.
  // We use it as the mapbox ID for the feature to simplify unified hover/selection styling.
  EID: {
    displayName: 'Experiment ID',
    sheetId: 'eid'
  },
  NAME: {
    displayName: 'Name of Experiment',
    sheetId: 'name'
  },
  // TYPE: {
  //   displayName: 'Past, Ongoing, Proposed',
  //   sheetId: 'type'
  // },
  LOCATION: {
    displayName: 'Location',
    sheetId: 'location'
  },
  DATES: {
    displayName: 'Implementation Dates',
    sheetId: 'dates'
  },
  STATUS: {
    displayName: 'Implementation Status',
    sheetId: 'status'
  },
  MANAGER: {
    displayName: 'Managing Organizations/Agencies',
    sheetId: 'org'
  },
  AFFILIATIONS: {
    displayName: 'Other Affiliations',
    sheetId: 'affiliations'
  },
  NEIGHBORHOOD: {
    displayName: 'Neighborhood',
    sheetId: 'neighborhood'
  },
  START: {
    displayName: 'Implementation Start',
    sheetId: 'start'
  },
  FUNDING: {
    displayName: 'Total Number of Participants',
    sheetId: 'funding'
  },
  DETAILS: {
    displayName: 'Targeting Details',
    sheetId: 'details'
  },
  DURATION: {
    displayName: 'Duration of Payment',
    sheetId: 'duration'
  },
  INTERVENTION: {
    displayName: 'Other Intervention Components',
    sheetId: 'intervention'
  },
  RCT: {
    displayName: 'Is the pilot a Randomized Control Trial (RCT)',
    sheetId: 'rct'
  },
  RECIPIENTS: {
    displayName: 'Number of Recipients',
    sheetId: 'recipients'
  },
  TARGETING: {
    displayName: 'Type of Targeting',
    sheetId: 'targeting',
    // isExpandible: true
  },
  UNIT: {
    displayName: 'Participants receiving the transfer ',
    sheetId: 'unit'
  },
  AMOUNT: {
    displayName: 'Transfer amount',
    sheetId: 'amount',
    // isExpandible: true
  },
  FREQUENCY: {
    displayName: 'Frequency of Payment',
    sheetId: 'frequency'
  },
};

const LINK_FIELD_PAIRS = [
  { urlField: SHEET_FIELDS.LINKURL1, titleField: SHEET_FIELDS.LINKTITLE1 },
  { urlField: SHEET_FIELDS.LINKURL2, titleField: SHEET_FIELDS.LINKTITLE2 },
  { urlField: SHEET_FIELDS.LINKURL3, titleField: SHEET_FIELDS.LINKTITLE3 },
  { urlField: SHEET_FIELDS.LINKURL4, titleField: SHEET_FIELDS.LINKTITLE4 },
  { urlField: SHEET_FIELDS.LINKURL5, titleField: SHEET_FIELDS.LINKTITLE5 },
  { urlField: SHEET_FIELDS.LINKURL6, titleField: SHEET_FIELDS.LINKTITLE6 },
];

const FEATURE_HEADERS = {
  ORGANIZATIONAL: {
    displayName: 'ORGANIZATIONAL FEATURES',
    sheetId: null,
    isFeatureHeader: true
  },
  IMPLEMENTATION: {
    displayName: 'IMPLEMENTATION FEATURES',
    sheetId: null,
    isFeatureHeader: true
  },
};

const COMPOSITE_FIELDS = {
  RELATED_RESOURCES: {
    displayName: 'Links to Related Resources',
    sheetId: null,
    // isExpandible: true,
    isComposite: true
  }
};

const ORDERED_CARD_FIELDS = [
  SHEET_FIELDS.LOCATION,
  SHEET_FIELDS.DATES,
  SHEET_FIELDS.STATUS,
  SHEET_FIELDS.NEIGHBORHOOD,
  FEATURE_HEADERS.ORGANIZATIONAL,
  SHEET_FIELDS.MANAGER,
  SHEET_FIELDS.AFFILIATIONS,
  FEATURE_HEADERS.IMPLEMENTATION,
  SHEET_FIELDS.START,
  SHEET_FIELDS.RECIPIENTS,
  SHEET_FIELDS.FUNDING,
  SHEET_FIELDS.UNIT,
  SHEET_FIELDS.TARGETING,
  SHEET_FIELDS.DETAILS,
  SHEET_FIELDS.AMOUNT,
  SHEET_FIELDS.FREQUENCY,
  SHEET_FIELDS.DURATION,
  SHEET_FIELDS.INTERVENTION,
  SHEET_FIELDS.RCT,
];

const ORDERED_CSV_FIELDS = [
  SHEET_FIELDS.NAME,
  SHEET_FIELDS.LOCATION,
  SHEET_FIELDS.DATES,
  SHEET_FIELDS.STATUS,
  SHEET_FIELDS.NEIGHBORHOOD,
  SHEET_FIELDS.MANAGER,
  SHEET_FIELDS.AFFILIATIONS,
  SHEET_FIELDS.START,
  SHEET_FIELDS.RECIPIENTS,
  SHEET_FIELDS.FUNDING,
  SHEET_FIELDS.UNIT,
  SHEET_FIELDS.TARGETING,
  SHEET_FIELDS.DETAILS,
  SHEET_FIELDS.AMOUNT,
  SHEET_FIELDS.FREQUENCY,
  SHEET_FIELDS.DURATION,
  SHEET_FIELDS.INTERVENTION,
  SHEET_FIELDS.RCT,
];

export {
  SHEET_FIELDS,
  FEATURE_HEADERS,
  COMPOSITE_FIELDS,
  ORDERED_CARD_FIELDS,
  ORDERED_CSV_FIELDS,
  LINK_FIELD_PAIRS
};