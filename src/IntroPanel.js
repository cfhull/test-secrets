import React from 'react';
import TriggerIcon, { ICON_TYPE } from './TriggerIcon';

class IntroPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: true };

    this.toggleOpen = this.toggleOpen.bind(this);
  }

  toggleOpen() {
    this.setState(state => ({ open: !state.open }));
  }

  render() {
    let classes = 'intro-panel';
    if (!this.state.open) {
      classes += ' closed';
    }

    const iconType = this.state.open ? ICON_TYPE.COLLAPSE : ICON_TYPE.EXPAND;
    return (
      <div className={classes}>
        <TriggerIcon onClick={this.toggleOpen} iconType={ICON_TYPE.INFO_ICON} />
        <div className='content'>
          <h1>Map of Universal Basic Income Experiments and Related Programs</h1>
          <p>How and where have Universal Basic Income (UBI) and its cousin policies been tested? What are some significant differences between these programs and which features do they share with an ideal UBI policy? What impacts can be measured when giving individuals unconditional cash on a regular basis? This geospatial map presents UBI-related experiments, pilots, programs and policies throughout the world, some past and some ongoing, and enables the user to compare them across a range of design and implementation features. It sheds light on many basic income related experiments over the past 60 years in order to inform the current dialogue around a potential basic income policy in the United States and beyond.</p>
          <h2>INCLUSION CRITERIA</h2>
          <p>The map contains experiments, pilots, policies and programs that have design and implementation features that crossover with the key principles of a universal basic income: unconditional, universal, regular, individual, and paid in cash. </p>
          <p>As described in the review of the State of the Evidence on Universal Basic Income-type programs: An Umbrella Review (Hasdell, forthcoming), experiments recognized as pertinent to UBI research  are varied and can be classified into different types of cash transfer programs ranging from unconditional and universal cash to supplemental income schemes to resource dividends and minimum income guarantees (through a negative income tax). </p>
          <p>The experiments, pilots, policies and programs we have included in this geospatial map all share multiple of the aforementioned features of a universal basic income policy and are frequently cited in the basic income literature used to infer potential impacts of a basic income policy (see Hoynes and Rothstein, 2019; Gentilini et. al, 2019, and Banerjee et. al, 2019; and Gibson et. al, 2018).</p>
          <p>The Basic Income Lab included these experiments for this current version. Over time, we hope to add more experiments as they come to light.</p>
        </div>
      </div>
    )
  }
}

export default IntroPanel;
