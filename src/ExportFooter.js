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
    // console.log('print selected');
    printPDF(cardData, printHeading, printText, footerText);
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
