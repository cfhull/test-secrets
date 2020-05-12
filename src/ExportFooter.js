import React from 'react';
import TriggerIcon, { ICON_TYPE } from './TriggerIcon';

class ExportFooter extends React.Component {
  constructor(props) {
    super(props);
  }

  print() {
    console.log('print');
  }
  
  export() {
    console.log('export');
  }
  
  copy() {
    console.log('share');
  }

  render() {
    return (
      <div className='export-footer'>
        <div className='print section'>
          <div className='title element'>Print</div>
          <div className='icon element'></div>
          <div className='description element'>
            Print or save your experiments as a PDF
          </div>
          <div className='button element' onClick={this.print}>PRINT</div>
        </div>

        <div className='export section'>
          <div className='title element'>Export</div>
          <div className='icon element'></div>
          <div className='description element'>
            Export your selected experiments to CSV
          </div>
          <div className='button element' onClick={this.props.exportCSV}>EXPORT</div>
        </div>

        <div className='share section'>
          <div className='title element'>Share</div>
          <div className='icon element'></div>
          <div className='description element'>
            Share a link to your selected experiments
          </div>
          <div className='button-group element'>
            <input type='text' value='www.linkvalue.com' readOnly />
            <div className='button' onClick={this.copy}>COPY</div>
          </div>
        </div>
      </div>
    )
  }
}

export default ExportFooter;
