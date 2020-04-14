import React from 'react';

class LoadingMask extends React.Component {
  render() {
    const { dataLoaded, mapLoaded, mapConfigured } = this.props;
    let classes = 'mask';
    if (dataLoaded && mapLoaded && mapConfigured) {
      classes += ' loaded'
    }
    
    return (
      <div className={classes}>
        <div className='content'>
          <p>Loading...</p>
          <div className='loading-dots'>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    )
  }
}

export default LoadingMask;
