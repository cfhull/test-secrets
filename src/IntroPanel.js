import React from 'react';
import TriggerIcon, { ICON_TYPE } from './TriggerIcon';

const SECTIONS = [
  { 
    name: 'Introduction',
    text: 'How and where have Universal Basic Income (UBI) and its cousin policies been tested? What are some significant differences between these programs? What impacts can be measured when giving individuals unconditional cash on a regular basis? This geospatial map presents UBI-related experiments, pilots, programs and policies throughout the world, some past and some ongoing, and enables the user to compare them across a range of designs and implementation features. Through the data it presents, it seeks to help inform the current dialogue around a potential basic income policy in the United States and beyond.',
    //text2: 'This geospatial map presents UBI-related experiments, pilots, programs and policies throughout the world, some past and some ongoing, and enables the user to compare them across a range of design and implementation features. It sheds light on many basic income related experiments over the past 60 years in order to inform the current dialogue around a potential basic income policy in the United States and beyond.',
    //text3: 'To view information about each experiment on the map, click or tap on a dot and a card will appear. Scroll down within the card to see a full table of data about the experiment, and add more experiments (up to 3) for comparison. Scroll below the experiment data tables to find options for sharing and exporting your selections via print, CSV files, and custom links.'
  },
  { 
    name: 'Inclusion Criteria',
    text: 'The map contains experiments, pilots, policies and programs that have design and implementation features that crossover with the key principles of a universal basic income: unconditional, universal, regular, individual, and paid in cash. All included programs share multiple of the features of a universal basic income policy and, for this reason, are frequently cited in the basic income literature used to infer potential impacts of a basic income policy (see Hoynes and Rothstein, 2019; Gentilini et. al, 2019, and Banerjee et. al, 2019; and Gibson et. al, 2018). Over time, we hope to add more experiments as they come to light.',
    //text2: 'As described in the review of the State of the Evidence on Universal Basic Income-type programs: An Umbrella Review (Hasdell, forthcoming), experiments used to draw conclusions about UBI include the following categories of cash transfers: unconditional and universal cash to supplemental income schemes to resource dividends and minimum income guarantees (through a negative income tax).',
    //text3: 'The experiments, pilots, policies and programs we have included in this geospatial map all share multiple of the aforementioned features of a universal basic income policy and are frequently cited in the basic income literature used to infer potential impacts of a basic income policy (see Hoynes and Rothstein, 2019; Gentilini et. al, 2019, and Banerjee et. al, 2019; and Gibson et. al, 2018).',
    //text4: 'The Basic Income Lab included these experiments for this current version. Over time, we hope to add more experiments as they come to light.'
  },
  { 
    name: 'How to Use',
    text: 'To view information about each experiment on the map, click or tap on a dot and a card will appear. Scroll down within the card to see a full table of data about the experiment, and add more experiments (up to 3) for comparison. Scroll below the experiment data tables to share and export your selections via print, CSV files, and custom links.',
    //text2: 'As described in the review of the State of the Evidence on Universal Basic Income-type programs: An Umbrella Review (Hasdell, forthcoming), experiments used to draw conclusions about UBI include the following categories of cash transfers: unconditional and universal cash to supplemental income schemes to resource dividends and minimum income guarantees (through a negative income tax).',
    //text3: 'The experiments, pilots, policies and programs we have included in this geospatial map all share multiple of the aforementioned features of a universal basic income policy and are frequently cited in the basic income literature used to infer potential impacts of a basic income policy (see Hoynes and Rothstein, 2019; Gentilini et. al, 2019, and Banerjee et. al, 2019; and Gibson et. al, 2018).',
    //text4: 'The Basic Income Lab included these experiments for this current version. Over time, we hope to add more experiments as they come to light.'
  },
  { 
    name: 'Citation',
    text: 'Please cite as follows:',
    text2: 'Stanford Basic Income Lab [cartographer]. (2020). Global Map of Basic Income Experiments [map]. Retrieved from https://basicincome.stanford.edu/research/basic-income-experiments/',
    citationButton: {
      use: true,
      prompt: 'Copy Citation',
      copies: 'text2'
    }
  }
];

class IntroPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSectionIdx: 0,
      citeCopied: ['', '', '']
    };

    this.setActiveSection = this.setActiveSection.bind(this);
    this.advanceActiveSection = this.advanceActiveSection.bind(this);
    this.prevActiveSection = this.prevActiveSection.bind(this);
  }

  getHeader() {
    return (
      <div className='header'>
        <div className='info'><TriggerIcon iconType={ICON_TYPE.INFO_ICON} /></div>
        <h1>Map of Universal Basic Income Experiments and Related Programs</h1>
      </div>
    );
  }

  getNav() {
    const sections = SECTIONS.map((s, i) => {
      let classes = 'section-name';
      if (i === this.state.activeSectionIdx) {
        classes += ' active';
      }
      return <p className={classes} onClick={this.setActiveSection.bind(this, i)} key={s.name}>{s.name}</p>;
    });

    return(
      <div className='nav'>
        {sections}
      </div>
    )
  }

  getCitationButton = () => {
    const { activeSectionIdx } = this.state;
    let classes = 'citation-button ';
    const copyCitation = (citation) => {
      navigator.clipboard.writeText(citation);
      let cite_copied = this.state.citeCopied;
      cite_copied[activeSectionIdx] = 'copied';
      this.setState(state => ({ citeCopied: cite_copied }));
    }
    if (SECTIONS[activeSectionIdx].citationButton) {
      if (SECTIONS[activeSectionIdx].citationButton.use === true) {
        const citation = SECTIONS[activeSectionIdx][SECTIONS[activeSectionIdx].citationButton.copies];
        const prompt = SECTIONS[activeSectionIdx].citationButton.prompt;
        return (
          <div className={classes + this.state.citeCopied[activeSectionIdx]}>
            <p className='prompt' onClick={() => { copyCitation(citation) }}>{prompt}</p>
            <p className='confirmation'><i>Citation copied.</i></p>
          </div>
        );
      }
    }
  }

  getSection() {
    const { activeSectionIdx } = this.state;
    return (
      <div className='section-text'>
        <p>{SECTIONS[activeSectionIdx].text}</p>
        <p>{SECTIONS[activeSectionIdx].text2}</p>
        <p>{SECTIONS[activeSectionIdx].text3}</p>
        <p>{SECTIONS[activeSectionIdx].text4}</p>
      </div>
    );
  }
  
  getNextPrev() {
    const { activeSectionIdx } = this.state;

    let prevHandler = null;
    let prevClasses = 'advance-button prev'
    if (activeSectionIdx !== 0) {
      prevHandler = this.prevActiveSection;
      prevClasses += ' active';
    }
    const prevButton = (
      <p className={prevClasses} onClick={prevHandler}>
        <TriggerIcon iconType={ICON_TYPE.L_ARROW_STEMLESS} />
        PREVIOUS
      </p>
    );

    let nextHandler = null;
    let nextClasses = 'advance-button next'
    if (activeSectionIdx < (SECTIONS.length - 1)) {
      nextHandler = this.advanceActiveSection;
      nextClasses += ' active';
    }
    const nextButton = (
      <p className={nextClasses} onClick={nextHandler}>
        NEXT
        <TriggerIcon iconType={ICON_TYPE.R_ARROW_STEMLESS} />
      </p>
    );
    return (
      <div className='bottom-controls'>
        <div className="next-prev">{prevButton} {nextButton}</div>
      </div>
    );
  }
  
  setActiveSection(activeSectionIdx) {
    this.setState({ activeSectionIdx });
  }
  
  advanceActiveSection() {
    this.setState(state => ({ activeSectionIdx: state.activeSectionIdx + 1 }));
  }

  prevActiveSection() {
    this.setState(state => ({ activeSectionIdx: state.activeSectionIdx - 1 }));
  }

  render() {
    let classes = 'intro-panel-wrapper';
    if (!this.props.open) {
      classes += ' closed';
    }

    const iconType = this.props.open ? ICON_TYPE.L_ARROW_STEMLESS : ICON_TYPE.R_ARROW_STEMLESS;
    const title = this.props.open ? 'Close' : 'Open';
    return (
      <div className={classes}> 
        <div className='mobile-trigger'>
          <TriggerIcon className title={title} onClick={this.props.toggleOpen} iconType={ICON_TYPE.INFO_ICON} />
        </div>
        <div className='trigger'>
          <TriggerIcon title={title} onClick={this.props.toggleOpen} iconType={iconType} />
        </div>
        <div className='intro-panel'>
          <div className='content'>
            {this.getHeader()}
            {this.getNav()}
          </div>
          <div className='content-body'> 
            {this.getSection()}
            {this.getCitationButton()}
          </div> 
          <div className='content-nav'> 
            {this.getNextPrev()}
          </div>
        </div>
      </div>
    )
  }
}

export default IntroPanel;
