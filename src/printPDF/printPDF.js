import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Fonts
import sofiaProRegular from './fonts/Sofia-Pro-Regular.js';
import sofiaProLight from './fonts/Sofia-Pro-Light.js';
import sofiaProBold from './fonts/Sofia-Pro-Bold.js';
import bullet from './images/bullet.js';

const { maxCharEllipsis } = require('max-char-ellipsis');

const printPDF = (cardData, printHeading, printText, footerText, location) => {
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
    } else if (item === 'related') {
      cardData.forEach(el => {
        arr.push('');
      });
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

  const trimString = (text, length) => {
    if (text.length > length) {
      return maxCharEllipsis(text, length);
    } else {
      return text;
    }
  }
  /**
   * Builds an array of "related links" objects with title and url
   * @param  String label    Label of row
   * @param  Array cardData  Array of arrays for each location
   * @return Array           Returns an array of objects, one for each link
   */
  const getRelatedLinksList = (index, cardData) => {
    // console.log('getRelatedLinksList');
    let maxTitleLength = 27;
    if (cardData.length === 2) {
      maxTitleLength = 35;
    }
    if (cardData.length === 1) {
      maxTitleLength = 86;
    }
    let arr = [];
    const item = cardData[index - 1][0];
    const linkCount = 6;
    for (var i = 1; i <= linkCount; i++) {
      if (item['linkurl' + i]) {
        if (item['linkurl' + i].length > 0) {
          if (item['linktitle' + i]) {
            // If there's a title, use that for display, else use link url.
            let title = trimString(item['linktitle' + i], maxTitleLength);
            arr.push({
              title: title,
              url: item['linkurl' + i]
            })
          } else {
            // No title, use link url for display.
            let title = trimString(item['linkurl' + i], maxTitleLength);
            arr.push({
              title: title,
              url: item['linkurl' + i]
            })
          }
        }
      }
    }
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
  const getTableContents = (cardData, doc) => {
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
      getTableRow('LINKS TO RELATED RESOURCES', cardData, 'related')
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
    // Use for adding content to the cells after they are drawn. This could be images or links.
   // You can also use this to draw other custom jspdf content to cells with doc.text or doc.rect
   // for example.
   didDrawCell: function (data) {
     // console.log('didDrawCell()');
     if (data.row.index === 15) {
       if (data.column.index > 0) {
         const links = getRelatedLinksList(data.column.index, cardData);
         const x = data.cell.textPos.x + 1;
         const y = data.cell.textPos.y + 2;
         links.forEach((el, i) => {
           // Insert image for bullet point.
           doc.addImage(bullet, 'PNG', x + 0.5, y + (5*i), 1, 1)
           // Insert bullet item.
           doc.textWithLink(el.title, x + 3, y + 1.5 + (5*i), {
             url: el.url
           });
         })
       }
     }
   },
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
      doc.text(footerText + ' ' + location, pageWidth - data.settings.margin.right, pageHeight - 10, 'right');
    }
  })
  doc.save('Basic-Income__Experiments-and-Related-Projects.pdf');
}

export default printPDF;
