import React from 'react';

class LoadingMask extends React.Component {
  render() {
    let classes = 'mask';
    if (this.props.loaded) {
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
