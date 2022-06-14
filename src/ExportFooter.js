import React from 'react';
import _ from 'lodash';
import 'svg/tw-icon.svg';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import printPDF from './printPDF/printPDF.js';

class ExportFooter extends React.Component {
  constructor(props) {
    super(props);

    this.tweet = this.tweet.bind(this);
    this.post = this.post.bind(this);
  }

  print(cardData, printHeading, printText, footerText, siteUrl) {
    // console.log('print selected');
    printPDF(cardData, printHeading, printText, footerText, siteUrl);
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

  tweet() {
    const tweetText = `Stanford Basic Income Lab's Global Map of Basic Income Experiments`;
    window
      .open(
        `https://twitter.com/share?text=${tweetText}&url=${this.props.siteUrl}`,
        '_blank',
        'width=550,height=420',
      )
      .focus();
  }

  post() {
    window
      .open(
        `https://www.facebook.com/sharer/sharer.php?u=${this.props.siteUrl}`,
        '_blank',
        'width=550,height=420',
      )
      .focus();
  }

  render() {
    const classes = 'export-footer ' + this.props.classes;
    return (
      <div className={classes}>
        <div className="print section">
          <div className="title element">Print</div>
          <div className="icon element"></div>
          <div className="description element">Print or save your experiments as a PDF</div>
          <div className="button-group element">
            <div
              className="button"
              onClick={() => {
                this.print(
                  this.props.cardData,
                  this.props.printHeading,
                  this.props.printText,
                  this.props.footerText,
                  this.props.siteUrl,
                );
              }}
            >
              PRINT
            </div>
          </div>
        </div>

        <div className="export section">
          <div className="title element">Export</div>
          <div className="icon element"></div>
          <div className="description element">Export your selected experiments to CSV</div>
          <div className="button-group element">
            <div className="button element" onClick={this.props.exportCSV}>
              EXPORT
            </div>
          </div>
        </div>

        <div className="share section">
          <div className="title element">Share</div>
          <div className="icon element"></div>
          <div className="description element">Share a link to your selected experiments</div>
          <div className="button-group element">
            <input id="url-text" type="text" value={this.props.siteUrl} onChange={_.noop} />
            <div className="button" onClick={this.copy}>
              COPY
            </div>
          </div>
          <div className="socialshare">
            <a className="twitter-share-button twittershare" onClick={this.tweet} href="#">
              <div className="twitter">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 15 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15 0.00687799C14.3471 0.468878 13.6242 0.822228 12.8591 1.05333C12.4485 0.579698 11.9027 0.243998 11.2957 0.0916382C10.6887 -0.0607218 10.0497 -0.022402 9.4651 0.201428C8.8805 0.425258 8.3785 0.823798 8.027 1.34314C7.6756 1.86248 7.4916 2.47756 7.5 3.10521V3.78917C6.3018 3.82033 5.1145 3.55376 4.04387 3.01318C2.97323 2.4726 2.05249 1.6748 1.36364 0.690838C1.36364 0.690838 -1.36364 6.8465 4.77273 9.5823C3.36854 10.5384 1.69579 11.0179 0 10.9502C6.1364 14.37 13.6364 10.9502 13.6364 3.08469C13.6357 2.89418 13.6175 2.70413 13.5818 2.517C14.2777 1.8286 14.7687 0.959428 15 0.00687799Z" />
                </svg>
              </div>
            </a>
            <a onClick={this.post} href="#">
              <div className="fb">
                <svg
                  width="27"
                  height="27"
                  viewBox="0 0 7 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1.51301 2.90498C1.51301 3.28298 1.51301 4.97015 1.51301 4.97015H0V7.49546H1.51301V14.9998H4.62106V7.49567H6.70671C6.70671 7.49567 6.90204 6.2848 6.99672 4.96084C6.72526 4.96084 4.63282 4.96084 4.63282 4.96084C4.63282 4.96084 4.63282 3.4917 4.63282 3.23419C4.63282 2.97612 4.97169 2.62898 5.30662 2.62898C5.64092 2.62898 6.34649 2.62898 7 2.62898C7 2.28516 7 1.09717 7 9.02072e-09C6.12759 9.02072e-09 5.13507 9.02072e-09 4.69758 9.02072e-09C1.43619 -0.000174361 1.51301 2.52764 1.51301 2.90498Z" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ExportFooter;
