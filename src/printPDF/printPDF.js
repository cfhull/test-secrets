import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Fonts
import sofiaProRegular from './fonts/Sofia-Pro-Regular.js';
import sofiaProLight from './fonts/Sofia-Pro-Light.js';
import sofiaProBold from './fonts/Sofia-Pro-Bold.js';

const printPDF = (cardData, printHeading, printText, footerText) => {
  // console.log('printPDF()', _cardData);
  console.log('printPDF()', cardData, footerText);
  /**
   * Returns array of table headers based on contents of cardData
   * @param  Object cardData
   * @return Array
   */
  const getTableHeaders = (cardData) => {
    // let cardArr = Object.values(cardData);
    // console.log(cardArr);
    let arr = [''];
    cardData.forEach(el => {
      // console.log(el[0].name);
      arr.push(el[0].name);
    })
    // console.log(arr);
    return [arr];
  }

  // todo: make this iterative over all elements
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

  const getTableLinksRow = (label, cardData) => {
    let linkCount = 6;
    // cardData.forEach(el => {
    //   for (let i = 1; i++; i <= linkCount) {
    //     if (el[0].)
    //   }
    // })
    return [label, '', '', ''];
  }

  const getHeadingRow = (label, cardData) => {
    // let arr = [''];
    // cardData.forEach(() => {
    //   arr.push(label);
    // })
    let arr = [{
      content: label,
      colSpan: 4,
      styles: {
        valign: 'middle',
        halign: 'center',
        font: 'Sofia Pro Light',
        fontSize: 11,
        fontColor: '#757575'
      }
    }];
    return arr;
  }

  const getColumns = (cardData) => {
    let arr = [{dataKey: 0}];
    cardData.forEach((i, el) => {
      arr.push({datakey: i + 1});
    })
    console.log('getColumns, ', arr);
    return arr;
  }

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
        0: {minCellWidth: '40'},
        1: {minCellWidth: '20'},
        2: {minCellWidth: '20'},
        3: {minCellWidth: '20'},
      };
    }
  }

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
      getTableLinksRow('LINKS TO RELATED RESOURCES', cardData, 'website'),
    ]
    return body;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    format: 'letter'
  });

  // Add fonts
  doc.addFileToVFS('sofia-pro-regular.ttf', sofiaProRegular);
  doc.addFont('sofia-pro-regular.ttf', 'Sofia Pro Regular', 'normal');
  doc.addFileToVFS('sofia-pro-light.ttf', sofiaProLight);
  doc.addFont('sofia-pro-light.ttf', 'Sofia Pro Light', 'normal');
  doc.addFileToVFS('sofia-pro-bold.ttf', sofiaProBold);
  doc.addFont('sofia-pro-bold.ttf', 'Sofia Pro Bold', 'normal');

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
    showHead: 'firstPage',
    showFoot: 'everyPage',
    styles: {
      fillColor: '#fff',
      textColor: '#000',
      font: 'Sofia Pro Regular',
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: '#f9f9f9',
      textColor: '#000',
      font: 'Sofia Pro Bold'
    },
    cellWidth: 'auto',
    startY: 35,
    didDrawPage: function (data) {
      // var totalPagesExp = '{total_pages_count_string}'
      // Header
      if (doc.internal.getNumberOfPages() === 1) {
        // Heading
        doc.setFont('Sofia Pro Bold');
        doc.setFontSize(20)
        doc.text(printHeading, data.settings.margin.left, 22)
        // Intro text
        doc.setFont('Sofia Pro Regular');
        doc.setFontSize(12)
        doc.setFontStyle('normal')
        doc.text(printText, data.settings.margin.left, 28)
      }

      // Footer page number and source info
      var pageNum = 'Page ' + doc.internal.getNumberOfPages();

      // Total page number plugin only available in jspdf v1.0+
      // if (typeof doc.putTotalPages === 'function') {
      //   str = str + ' of ' + doc.putTotalPages(totalPagesExp)
      //   console.log('total pages obj ', doc.putTotalPages(totalPagesExp));
      // }
      doc.setFontSize(10)

      // jsPDF 1.4+ uses getWidth, <1.4 uses .width
      var pageSize = doc.internal.pageSize
      var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
      var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth()
      doc.text(pageNum, data.settings.margin.left, pageHeight - 10)
      // doc.text(footerText, data.settings.margin.right , pageHeight - 10)
      doc.text(footerText, pageWidth - data.settings.margin.right, pageHeight - 10, 'right');
    }
  })
  doc.save('Basic-Income__Experiments-and-Related-Projects.pdf');
}

export default printPDF;
