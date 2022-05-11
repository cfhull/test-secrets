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


  // DATES: {
  //   displayName: 'Implementation Dates',
  //   sheetId: 'dates'
  // },
  RECIPIENTS: {
    displayName: 'Number of Recipients',
    sheetId: 'recipients'
  },
  // IMPLEMENTER: {
  //   displayName: 'Implementing Agency',
  //   sheetId: 'implementer',
  //   // isExpandible: true
  // },
  // RESEARCHER: {
  //   displayName: 'Research Agency',
  //   sheetId: 'researcher',
  //   // isExpandible: true
  // },
  // FUNDER: {
  //   displayName: 'Funding Agency',
  //   sheetId: 'funder',
  //   // isExpandible: true
  // },
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
  // EVALUATION: {
  //   displayName: 'Method of Evaluation',
  //   sheetId: 'evaluation'
  // },
  // NOTES: {
  //   displayName: 'Additional Notes of Interest',
  //   sheetId: 'notes',
  //   // isExpandible: true
  // },
  // WEBSITE: {
  //   displayName: 'Link to Website',
  //   sheetId: 'website',
  //   forceUniformValue: true
  // },
  // LINKURL1: {
  //   displayName: 'Link to Related Resource 1',
  //   sheetId: 'linkurl1'
  // },
  // LINKTITLE1: {
  //   displayName: 'Link title 1',
  //   sheetId: 'linktitle1'
  // },
  // LINKURL2: {
  //   displayName: 'Link to Related Resource 2',
  //   sheetId: 'linkurl2'
  // },
  // LINKTITLE2: {
  //   displayName: 'Link title 2',
  //   sheetId: 'linktitle2'
  // },
  // LINKURL3: {
  //   displayName: 'Link to Related Resource 3',
  //   sheetId: 'linkurl3'
  // },
  // LINKTITLE3: {
  //   displayName: 'Link title 3',
  //   sheetId: 'linktitle3'
  // },
  // LINKURL4: {
  //   displayName: 'Link to Related Resource 4',
  //   sheetId: 'linkurl4'
  // },
  // LINKTITLE4: {
  //   displayName: 'Link title 4',
  //   sheetId: 'linktitle4'
  // },
  // LINKURL5: {
  //   displayName: 'Link to Related Resource 5',
  //   sheetId: 'linkurl5'
  // },
  // LINKTITLE5: {
  //   displayName: 'Link title 5',
  //   sheetId: 'linktitle5'
  // },
  // LINKURL6: {
  //   displayName: 'Link to Related Resource 6',
  //   sheetId: 'linkurl6'
  // },
  // LINKTITLE6: {
  //   displayName: 'Link title 6',
  //   sheetId: 'linktitle6'
  // }
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