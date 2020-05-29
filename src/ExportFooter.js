import React from 'react';
import _ from 'lodash';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import printPDF from './printPDF/printPDF.js'

class ExportFooter extends React.Component {
  constructor(props) {
    super(props);
  }

  

  print(cardData, printHeading, printText, footerText) {
    // window.print();
    console.log('print');
    console.log(cardData, printHeading, footerText);

    printPDF(cardData, printHeading, printText, footerText);

    // Generate a PDF from HTML elements in the page.
    // var element = document.getElementById('card_table');
    // html2pdf(element, {
    //   margin:       1,
    //   pagebreak: 'avoid-all',
    //   filename:     'myfile.pdf',
    //   image:        { type: 'jpeg', quality: 0.98 },
    //   html2canvas:  { dpi: 192, letterRendering: true },
    //   jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    // });

    // Grab table from html and use jsPDF
    // const doc = new jsPDF({
    //   orientation: 'landscape',
    //   format: 'letter'
    // });
    // doc.setProperties({
    //   title: printHeading,
    //   subject: printText,
    //   author: 'Stanford Basic Income Lab',
    //   keywords: 'basic income',
    //   creator: 'Stanford Basic Income Lab'
    // });
    // doc.autoTable({
    //   head: this.getTableHeaders(cardData),
    //   body: this.getTableContents(cardData),
    //   columns: [{dataKey: 0}, {dataKey: 1}, {dataKey: 2}, {dataKey: 3}],
    //   columnStyles: {
    //     0: {minCellWidth: '34'},
    //     1: {minCellWidth: '73'},
    //     2: {minCellWidth: '73'},
    //     3: {minCellWidth: '73'},
    //   },
    //   showHead: 'firstPage',
    //   showFoot: 'everyPage',
    //   styles: { fillColor: '#fff', textColor: '#000', font: 'helvetica', overflow: 'linebreak'},
    //   headStyles: { fillColor: '#f9f9f9', textColor: '#000', font: 'helvetica' },
    //   cellWidth: 'auto',
    //   startY: 30,
    //   didDrawPage: function (data) {
    //     var totalPagesExp = '{total_pages_count_string}'
    //     // Header
    //     doc.setFontSize(20)
    //     // doc.setTextColor(40)
    //     doc.setFontStyle('normal')
    //     // if (base64Img) {
    //     //   doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 15, 10, 10)
    //     // }
    //     // doc.text(printHeading, data.settings.margin.left + 15, 22)
    //     if (doc.internal.getNumberOfPages() === 1) {
    //       doc.text(printHeading, data.settings.margin.left, 22)
    //     }
    // 
    //     doc.setFontSize(12)
    //     // doc.setTextColor(40)
    //     doc.setFontStyle('normal')
    //     // doc.addHTML(printText, data.settings.margin.left, 22) // TODO: ADD LIB TO DO THIS. FOOTER INSTEAD OF HEADING? 
    // 
    //     // Footer
    //     var str = 'Page ' + doc.internal.getNumberOfPages()
    //     // Total page number plugin only available in jspdf v1.0+
    //     if (typeof doc.putTotalPages === 'function') {
    //       // str = str + ' of ' + totalPagesExp
    //       str = str + ' of ' + doc.putTotalPages(totalPagesExp)
    //     }
    //     doc.setFontSize(10)
    // 
    //     // jsPDF 1.4+ uses getWidth, <1.4 uses .width
    //     var pageSize = doc.internal.pageSize
    //     var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
    //     doc.text(str, data.settings.margin.left, pageHeight - 10)
    //   }
    // })
    // doc.save('Basic-Income__Experiments-and-Related-Projects.pdf')
  }

  export() {
    console.log('export');
  }

  copy() {
    /* Method from w3 */
    const urlText = document.getElementById('url-text');
    urlText.select(); /* Select the text field */
    urlText.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand('copy'); /* Copy the text inside the text field */
  }

  render() {
    const classes = 'export-footer ' + this.props.classes;
    return (
      <div className={classes}>
        <div className='print section'>
          <div className='title element'>Print</div>
          <div className='icon element'></div>
          <div className='description element'>
            Print or save your experiments as a PDF
          </div>
          <div className='button-group element'>
            <div className='button' onClick={() => {
                this.print(
                  this.props.cardData,
                  this.props.printHeading,
                  this.props.printText,
                  this.props.footerText)
              }}>PRINT</div>
          </div>
        </div>

        <div className='export section'>
          <div className='title element'>Export</div>
          <div className='icon element'></div>
          <div className='description element'>
            Export your selected experiments to CSV
          </div>
          <div className='button-group element'>
            <div className='button element' onClick={this.props.exportCSV}>EXPORT</div>
          </div> 
        </div>

        <div className='share section'>
          <div className='title element'>Share</div>
          <div className='icon element'></div>
          <div className='description element'>
            Share a link to your selected experiments
          </div>
          <div className='button-group element'>
            <input id='url-text' type='text' value={this.props.siteUrl} onChange={_.noop} />
            <div className='button' onClick={this.copy}>COPY</div>
          </div>
        </div>
      </div>
    )
  }
}

export default ExportFooter;
