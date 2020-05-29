import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Fonts
import sofiaProRegular from './fonts/Sofia-Pro-Regular.js';
import sofiaProLight from './fonts/Sofia-Pro-Light.js';
import sofiaProBold from './fonts/Sofia-Pro-Bold.js';

const printPDF = (cardData, printHeading, printText, footerText) => {
  // console.log('printPDF()', cardData, footerText);

  /**
   * Returns array of table headers based on contents of cardData
   * @param  Object cardData
   * @return Array
   */
  const getTableHeaders = (cardData) => {
    // console.log(cardArr);
    const hStyles = {
      font: 'helvetica',
      fillColor: '#f9f9f9',
      textColor: '#000',
    };
    let arr = [{
      content: '',
      styles: hStyles
    }];
    cardData.forEach(el => {
      // console.log(el[0].name);
      arr.push({
        content: el[0].name,
        styles: hStyles
      });
    })
    // console.log(arr);
    return [arr];
  }

  /**
   * Fetches a table row based on row type
   * @param  String label    Row label
   * @param  Array cardData  Array of cards
   * @param  String item     Type of row
   * @return Array
   */
  const getTableRow = (label, cardData, item) => {
    let arr = [label];

    if (item === 'location') {
      cardData.forEach(el => {
        // console.log(el[0].name)
        let str = '';
        el.forEach(i => {
          // console.log(i);
          // console.log(i[item]);
          if ((i[item]).length >= 0) {
            str = str + i[item] + '\n';
          }
        })
        arr.push(str);
      })
    } else if (item === 'recipients') {
      cardData.forEach(el => {
        // If more than one item in recipients array, fancy formatting.
        if (el.length > 1) {
          let str = '';
          el.forEach(i => {
            if ((i[item]).length >= 0) {
              str = str + String(i['location']).replace(';', '') + ': ' + i[item] + '\n\n';
            }
          })
          arr.push(str);
        } else {
          // If only one item in recipients array, no fancy formatting.
          if (el[0][item].length > 0) {
            arr.push(el[0][item]);
          }
        }
      })
    } else {
      // Regular, no fancy formatting.
      cardData.forEach(el => {
        // console.log(el[0].name)
        if (el[0][item].length > 0) {
          arr.push(el[0][item]);
        }
      })
    }

    // console.log(arr);
    if (arr.length <= 0) {
      arr.push('N/A');
    }
    return arr;
  }

  /**
   * Builds an array of lists of "related links"
   * @param  String label    Label of row
   * @param  Array cardData  Array of arrays for each location
   * @return Array           Returns an array with an item for each cell in the row
   */
  const getTableLinksRow = (label, cardData) => {
    // console.log('getTableLinksRow')
    let arr = [label];
    cardData.forEach(el => {
      let list = '';
      const item = el[0];
      const linkCount = 6;
      for (var i = 1; i <= linkCount; i++) {
        // console.log('linkurl' + i + ': ' + item['linkurl' + i])
        if (item['linkurl' + i]) {
          if (item['linkurl' + i].length > 0) {
            list = list + item['linktitle' + i] + ': ' + item['linkurl' + i] + '\n\n';
          }
        }
      }
      arr.push(list)
    })
    // console.log(arr);
    return arr;
  }

  /**
   * Fetches special row for in-table heading dividers
   * @param  String label   Row label
   * @param  Array cardData Array of cards for each location
   * @return Array          Array with one item for each cell in the row
   */
  const getHeadingRow = (label, cardData) => {
    let arr = [{
      content: label,
      colSpan: 4,
      styles: {
        valign: 'middle',
        halign: 'center',
        font: 'SofiaProLight',
        fontSize: 11,
        fontColor: '#757575'
      }
    }];
    return arr;
  }

  /**
   * Builds columns based on number of items in cardData
   * @param  Array cardData Array of cards for each location/project selected
   * @return Array          Array of columns
   */
  const getColumns = (cardData) => {
    let arr = [{dataKey: 0}];
    cardData.forEach((i, el) => {
      arr.push({datakey: i + 1});
    })
    return arr;
  }

  /**
   * Sets column styling for all columns based on number of cards.
   * @param  Array cardData Array of location cards
   * @return Object         Styles object (mostly for column width)
   */
  const getColumnStyle = (cardData) => {
    if (cardData.length === 1) {
      return {
        0: {minCellWidth: '75'},
        1: {minCellWidth: '150'}
      };
    }
    if (cardData.length === 2) {
      return {
        0: {minCellWidth: '80'},
        1: {minCellWidth: '80'},
        2: {minCellWidth: '80'}
      };
    }
    if (cardData.length === 3) {
      return {
        0: {minCellWidth: '60'},
        1: {minCellWidth: '60'},
        2: {minCellWidth: '60'},
        3: {minCellWidth: '60'},
      };
    }
  }

  /**
   * Fetches table contents by calling row-building functions.
   * @param  Array cardData Array of cards for each location
   * @return Array
   */
  const getTableContents = (cardData) => {
    var body = [
      getTableRow('LOCATION', cardData, 'location'),
      getTableRow('IMPLEMENTATION DATES', cardData, 'dates'),
      getTableRow('NUMBER OF RECIPIENTS', cardData, 'recipients'),
      getHeadingRow('ORGANIZATIONAL FEATURES', cardData),
      getTableRow('IMPLEMENTING AGENCY', cardData, 'implementer'),
      getTableRow('RESEARCH AGENCY', cardData, 'researcher'),
      getTableRow('FUNDING AGENCY', cardData, 'funder'),
      getHeadingRow('IMPLEMENTATION FEATURES', cardData),
      getTableRow('TYPE OF TARGETING', cardData, 'targeting'),
      getTableRow('UNIT OF RECIPIENT', cardData, 'unit'),
      getTableRow('AMOUNT OF TRANSFER', cardData, 'amount'),
      getTableRow('FREQUENCY OF PAYMENT', cardData, 'frequency'),
      getTableRow('METHOD OF EVALUATION', cardData, 'evaluation'),
      getTableRow('ADDITIONAL NOTES OF INTEREST', cardData, 'notes'),
      getTableRow('LINK TO WEBSITE', cardData, 'website'),
      getTableLinksRow('LINKS TO RELATED RESOURCES', cardData),
    ]
    return body;
  }

  // Init jsPDF doc
  const doc = new jsPDF({
    orientation: 'landscape',
    format: 'letter',
    filters: ["ASCIIHexEncode"]
  });

  // Add fonts
  doc.addFileToVFS('sofia-pro-regular.ttf', sofiaProRegular);
  doc.addFont('sofia-pro-regular.ttf', 'SofiaProRegular', 'normal');
  doc.addFileToVFS('sofia-pro-light.ttf', sofiaProLight);
  doc.addFont('sofia-pro-light.ttf', 'SofiaProLight', 'normal');
  doc.addFileToVFS('sofia-pro-bold.ttf', sofiaProBold);
  doc.addFont('sofia-pro-bold.ttf', 'SofiaProBold', 'normal');

  // Set metadata
  doc.setProperties({
    title: printHeading,
    subject: printText,
    author: 'Stanford Basic Income Lab',
    keywords: 'basic income',
    creator: 'Stanford Basic Income Lab'
  });

  // Add table
  doc.autoTable({
    head: getTableHeaders(cardData),
    body: getTableContents(cardData),
    columns: getColumns(cardData),
    columnStyles: getColumnStyle(cardData),
    showHead: 'everyPage',
    showFoot: 'everyPage',
    styles: {
      fillColor: '#fff',
      textColor: '#000',
      font: 'SofiaProRegular',
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: '#f9f9f9',
      textColor: '#000',
      font: 'helvetica'
    },
    cellWidth: 'auto',
    startY: 35,
    didDrawPage: function (data) {
      // Header
      if (doc.internal.getNumberOfPages() === 1) {
        // Heading
        doc.setFont('SofiaProBold');
        doc.setFontSize(20)
        doc.text(printHeading, data.settings.margin.left, 22)
        // Intro text
        doc.setFont('SofiaProLight');
        doc.setFontSize(12)
        doc.setFontStyle('normal')
        doc.text(printText, data.settings.margin.left, 29)
      }

      // Footer page number and source info
      var pageNum = 'Page ' + doc.internal.getNumberOfPages();

      // Total page number plugin only available in jspdf v1.0+
      // var totalPagesExp = '{total_pages_count_string}'
      // if (typeof doc.putTotalPages === 'function') {
      //   str = str + ' of ' + doc.putTotalPages(totalPagesExp)
      //   console.log('total pages obj ', doc.putTotalPages(totalPagesExp));
      // }
      doc.setFont('SofiaProLight');
      doc.setFontSize(9)

      // jsPDF 1.4+ uses getWidth, <1.4 uses .width
      var pageSize = doc.internal.pageSize
      var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
      var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth()
      doc.text(pageNum, data.settings.margin.left, pageHeight - 10)
      doc.text(footerText, pageWidth - data.settings.margin.right, pageHeight - 10, 'right');
    }
  })
  doc.save('Basic-Income__Experiments-and-Related-Projects.pdf');
}

export default printPDF;
